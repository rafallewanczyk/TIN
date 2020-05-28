#include <osrng.h>
#include <files.h>
#include <netdb.h>
#include "src/server/server.hpp"
#include "src/connection-handler/connection-handler.hpp"

/////////////////////////////////////////////////
/// ATTENTION!! DO NOT REVIEW THIS CODE
/// THIS IS ONLY FOR DEBUGGING PURPOSES.
/// ATTENTION!!
////////////////////////////////////////////////

using namespace std;

double parseDouble(const std::string &bytes) {
    std::vector<char> b(bytes.begin(), bytes.end());
    double value = *(reinterpret_cast<double *>(b.data()));

    return value;
}

int main(int argc, char *argv[]) {
    std::shared_ptr<SecurityModule> security = std::make_shared<SecurityModule>("key.public.rsa");
    char protocol = '\0' + 1;
    char contentSize = '\0';
    char id = '\0';
    std::vector<char> bytesToSend;

    if (argc < 2) {
        std::cout << "not enough parameters" << std::endl;
        return 1;
    }
    std::string signature;
    if (strcmp(argv[1], "get") == 0) {
        auto encryptedData = security->encrypt(std::string("GET_TEMP"));
        signature = security->makeSignature(encryptedData);

        bytesToSend = {'\0', '\0', '\0', protocol, '\0', '\0', '\0', contentSize, '\0', '\0', '\0', id};
        bytesToSend.insert(bytesToSend.end(), encryptedData.begin(), encryptedData.end());
    } else if (strcmp(argv[1], "set") == 0) {
        if (argc < 3) {
            std::cout << "not enough parameters" << std::endl;
            return 2;
        }
        auto value = std::stod(argv[2]);
        std::array<char, 8> doubleBytes = {};
        std::memcpy(doubleBytes.data(), &value, 8);
        std::reverse(doubleBytes.begin(), doubleBytes.end());

        auto encryptedData = security->encrypt(std::string("CHANGE_TEMP") + std::string(doubleBytes.begin(), doubleBytes.end()));

        bytesToSend = {'\0', '\0', '\0', protocol, '\0', '\0', '\0', contentSize, '\0', '\0', '\0', id};
        bytesToSend.insert(bytesToSend.end(), encryptedData.begin(), encryptedData.end());
        signature = security->makeSignature(std::string(bytesToSend.begin() + 12, bytesToSend.end()));
    } else {
        bytesToSend = {'\0', '\0', '\0', protocol, '\0', '\0', '\0', contentSize, '\0', '\0', '\0', id};
        auto encryptedData = security->encrypt(std::string("PING"));
        signature = security->makeSignature(encryptedData);
        bytesToSend.insert(bytesToSend.end(), encryptedData.begin(), encryptedData.end());
    }
    bytesToSend.insert(bytesToSend.end(), signature.begin(), signature.end());
    auto bytesSize = int(bytesToSend.size());
    std::array<char, 4> doubleBytes = {};
    std::memcpy(doubleBytes.data(), &bytesSize, 4);
    bytesToSend[7] = doubleBytes[0];
    bytesToSend[6] = doubleBytes[1];
    bytesToSend[5] = doubleBytes[2];
    std::cout << "Sending bytes: " << bytesToSend.size() << std::endl;

    int sockfd, portno, n;
    struct sockaddr_in serv_addr;
    struct hostent *server;


    portno = 20001;
    sockfd = socket(AF_INET, SOCK_STREAM, 0);
    if (sockfd < 0) {
        std::cout << "ERROR opening socket" << std::endl;
    }
    server = gethostbyname("localhost");
    if (server == NULL) {
        fprintf(stderr, "ERROR, no such host\n");
        exit(0);
    }
    bzero((char *) &serv_addr, sizeof(serv_addr));
    serv_addr.sin_family = AF_INET;
    bcopy((char *) server->h_addr,
          (char *) &serv_addr.sin_addr.s_addr,
          server->h_length);
    serv_addr.sin_port = htons(portno);
    if (connect(sockfd, (struct sockaddr *) &serv_addr, sizeof(serv_addr)) < 0) {
        std::cout << ("ERROR connecting") << std::endl;
        exit(0);
    }
    std::cout << int(bytesToSend[6]) << std::endl;
    n = write(sockfd, bytesToSend.data(), bytesToSend.size());
    if (n < 0) {
        cout << ("ERROR writing to socket") << endl;
        exit(0);
    }
    std::vector<char> buffer(524);
    n = read(sockfd, buffer.data(), 524);
    if (n < 0) {
        cout << ("ERROR reading from socket") << endl;
        exit(0);
    }

    if (strcmp(argv[1], "get") == 0) {
        auto doubleData = std::string(buffer.begin() + 12, buffer.end() - 256);
        std::string response = security->decrypt(doubleData);
        std::reverse(response.begin() + 9, response.end());
        double val = parseDouble(response.substr(9, 8));
        std::cout << "Verified: " <<security->verifySignature(std::string(buffer.begin() + 12, buffer.end())) << std::endl;
        std::cout << "Current temp: " << val << std::endl;

    } else if (strcmp(argv[1], "set") == 0) {
    } else {
        std::string response(buffer.begin(), buffer.end());
        std::cout << "Whole data: " << response.substr(12) << std::endl;
    }

    close(sockfd);
    return 0;
}