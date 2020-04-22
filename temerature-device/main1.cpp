#include <osrng.h>
#include <files.h>
#include <netdb.h>
#include "src/server/server.hpp"
#include "src/connection-handler/connection-handler.hpp"

using namespace std;

int main(int argc, char *argv[]) {
    const int cSize = 31 + 32;
    char protocol = '\0' + 1;
    char contentSize = '\0' + cSize;
    char id = '\0';

    std::array<char, cSize> arr = {protocol, '\0', '\0', '\0', contentSize, '\0', '\0', '\0', '\0', '\0', '\0', id, 'C',
                                   'H', 'A', 'N', 'G', 'E', '_', 'T', 'E', 'M', 'P'};


    int sockfd, portno, n;
    struct sockaddr_in serv_addr;
    struct hostent *server;

    char buffer[256];
    while (true) {

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
        printf("Please enter the message: ");
        bzero(buffer, 256);
        n = write(sockfd, arr.data(), arr.size());
        if (n < 0) {
            cout << ("ERROR writing to socket") << endl;
            exit(0);
        }
        bzero(buffer, 256);
        n = read(sockfd, buffer, 255);
        if (n < 0) {
            cout << ("ERROR reading from socket") << endl;
            exit(0);
        }

        printf("%s\n", buffer);
    }
    close(sockfd);
    return 0;
}