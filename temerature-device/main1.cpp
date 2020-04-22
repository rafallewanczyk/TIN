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
    char protocol = '\0' + 1;
    char contentSize = '\0';
    char id = '\0';
    std::vector<char> bytesToSend;

    if (argc < 2) {
        std::cout << "not enough parameters" << std::endl;
        return 1;
    }

    if (strcmp(argv[1], "get") == 0) {
        bytesToSend = {protocol, '\0', '\0', '\0', contentSize, '\0', '\0', '\0', '\0', '\0', '\0', id,
                       'G', 'E', 'T', '_', 'T', 'E', 'M', 'P'};
    } else if (strcmp(argv[1], "set") == 0) {
        if (argc < 3) {
            std::cout << "not enough parameters" << std::endl;
            return 2;
        }
        auto value = std::stod(argv[2]);
        std::array<char, 8> doubleBytes = {};
        std::memcpy(doubleBytes.data(), &value, 8);
        bytesToSend = {protocol, '\0', '\0', '\0', contentSize, '\0', '\0', '\0', '\0', '\0', '\0', id,
                       'C', 'H', 'A', 'N', 'G', 'E', '_', 'T', 'E', 'M', 'P'};
        bytesToSend.insert(bytesToSend.end(), doubleBytes.begin(), doubleBytes.end());
    } else {
        bytesToSend = {protocol, '\0', '\0', '\0', contentSize, '\0', '\0', '\0', '\0', '\0', '\0', id,
                       'P', 'I', 'N', 'G'};
    }

    bytesToSend[4] = '\0' + int(bytesToSend.size());

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
    n = write(sockfd, bytesToSend.data(), bytesToSend.size());
    if (n < 0) {
        cout << ("ERROR writing to socket") << endl;
        exit(0);
    }
    std::vector<char> buffer(256);
    n = read(sockfd, buffer.data(), 255);
    if (n < 0) {
        cout << ("ERROR reading from socket") << endl;
        exit(0);
    }

    if (strcmp(argv[1], "get") == 0) {
        std::string response(buffer.begin(), buffer.end());
        double val = parseDouble(response.substr(12 + 9, 8));
        std::cout << "Whole data: " << response.substr(12, 9) << std::endl;
        std::cout << "Current temp: " << val << std::endl;

    } else if (strcmp(argv[1], "set") == 0) {
    } else {
        std::string response(buffer.begin(), buffer.end());
        std::cout << "Whole data: " << response.substr(12) << std::endl;
    }

    close(sockfd);
    return 0;
}