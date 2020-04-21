//
// Created by Jaroslaw Glegola on 14/04/2020.
//

#ifndef UNTITLED_CONNECTION_HANDLER_HPP
#define UNTITLED_CONNECTION_HANDLER_HPP


#include <netinet/in.h>
#include <chrono>
#include <thread>
#include <array>
#include "connection-lost-during-read-exception.hpp"
#include "header-handler.hpp"
#include "data-sender.hpp"
#include "data-reader.hpp"
#include "data-parser.hpp"

//class SendError : public std::runtime_error {
//public:
//    SendError() : std::runtime_error("Couldnt send the data. Aborting") {}
//};


class ConnectionHandler {
    int socketDescriptor;
    sockaddr_in clientAddress;
    DataSender sender;
    DataReader reader;
    DataParser dataParser;

    void handle() {
        auto data = reader.readAllData();

        for (char i : data) {
            std::cout << i;
        }

        auto parsedData = dataParser.parse(data);


        destroy();
    }

    void destroy() {
        close(socketDescriptor);
        std::cout << "Closing connection with port " << ntohs(clientAddress.sin_port) << std::endl;
    }

public:
    ConnectionHandler(int socketDescriptor, struct sockaddr_in clientAddress)
            : socketDescriptor(socketDescriptor),
              clientAddress(clientAddress),
              sender(socketDescriptor),
              reader(socketDescriptor) {}

    static void getConnectionHandler(int socketDescriptor, sockaddr_in clientAddress) {
        try {
            ConnectionHandler(socketDescriptor, clientAddress).handle();
        } catch (const std::exception &e) {
            return;
        }
    }
};


#endif //UNTITLED_CONNECTION_HANDLER_HPP
