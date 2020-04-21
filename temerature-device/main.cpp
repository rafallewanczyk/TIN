#include <osrng.h>
#include <files.h>
#include <netdb.h>
#include "src/server/server.hpp"
#include "src/connection-handler/connection-handler.hpp"
#include "rsa.h"
#include "src/security/security-module.hpp"

using namespace std;

int main(int argc, char *argv[]) {
//    auto server = Server("20001");
//    server.run(ConnectionHandler::getConnectionHandler);
//    SecurityModule security("regulator.public.rsa");
    int i = 68;
    std::vector<char> bytes(4);
    std::memcpy(bytes.data(), &i, 4);

    std::cout << bytes.size() << std::endl;
    std::cout << bytes.data() << std::endl;

//    int protocolVersion = std::stoi(std::string(array.begin(), array.begin() + 4));
//    int contentSize = std::stoi(std::string(array.begin() + 4, array.begin() + 8));
//    bytesToInt(std::vector<char>(array.begin(), array.begin() + 4));
//    std::cout << protocolVersion << std::endl;
//    std::cout << contentSize << std::endl;

    return 0;
//    int sockfd, portno, n;
//    struct sockaddr_in serv_addr;
//    struct hostent *server;
//
//    char buffer[256];
//    while (true) {
//
//        portno = 20001;
//        sockfd = socket(AF_INET, SOCK_STREAM, 0);
//        if (sockfd < 0) {
//            std::cout << "ERROR opening socket" << std::endl;
//        }
//        server = gethostbyname("localhost");
//        if (server == NULL) {
//            fprintf(stderr, "ERROR, no such host\n");
//            exit(0);
//        }
//        bzero((char *) &serv_addr, sizeof(serv_addr));
//        serv_addr.sin_family = AF_INET;
//        bcopy((char *) server->h_addr,
//              (char *) &serv_addr.sin_addr.s_addr,
//              server->h_length);
//        serv_addr.sin_port = htons(portno);
//        if (connect(sockfd, (struct sockaddr *) &serv_addr, sizeof(serv_addr)) < 0) {
//            std::cout << ("ERROR connecting") << std::endl;
//            exit(0);
//        }
//        printf("Please enter the message: ");
//        bzero(buffer, 256);
//        fgets(buffer, 255, stdin);
//        n = write(sockfd, buffer, strlen(buffer));
//        if (n < 0) {
//            cout << ("ERROR writing to socket") << endl;
//            exit(0);
//        }
//        bzero(buffer, 256);
//        n = read(sockfd, buffer, 255);
//        if (n < 0) {
//            cout << ("ERROR reading from socket") << endl;
//            exit(0);
//        }
//
//        printf("%s\n", buffer);
//    }
//    close(sockfd);
//    return 0;
}