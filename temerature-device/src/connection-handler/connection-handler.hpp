//
// Created by Jaroslaw Glegola on 14/04/2020.
//

#ifndef UNTITLED_CONNECTION_HANDLER_HPP
#define UNTITLED_CONNECTION_HANDLER_HPP


#include <netinet/in.h>
#include <chrono>
#include <thread>


class ConnectionHandler {
    int socketDescriptor;
    sockaddr_in clientAddress;

    void handle() {
        send(socketDescriptor, "Hello, world!\n", 13, 0);

        destroy();
    }

    void destroy() {
        close(socketDescriptor);
    }

public:
    ConnectionHandler(int socketDescriptor, struct sockaddr_in clientAddress)
            : socketDescriptor(socketDescriptor),
              clientAddress(clientAddress) {}

    static void getConnectionHandler(int socketDescriptor, sockaddr_in clientAddress) {
        ConnectionHandler(socketDescriptor, clientAddress).handle();
    }
};


#endif //UNTITLED_CONNECTION_HANDLER_HPP
