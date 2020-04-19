//
// Created by Jaroslaw Glegola on 14/04/2020.
//

#ifndef UNTITLED_CONNECTION_HANDLER_HPP
#define UNTITLED_CONNECTION_HANDLER_HPP


#include <netinet/in.h>
#include <chrono>
#include <thread>

class SendError : public std::runtime_error {
public:
    SendError() : std::runtime_error("Couldnt send the data. Aborting") {}
};

class ConnectionHandler {
    int socketDescriptor;
    sockaddr_in clientAddress;

    void handle() {
        if (send(socketDescriptor, "Hello, world!\n", 13, 0) < 0) {
            throw SendError();
        }

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
        try {
            ConnectionHandler(socketDescriptor, clientAddress).handle();
        } catch (const SendError &e) {
            return;
        }
    }
};


#endif //UNTITLED_CONNECTION_HANDLER_HPP
