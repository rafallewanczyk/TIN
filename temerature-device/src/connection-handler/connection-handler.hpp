//
// Created by Jaroslaw Glegola on 14/04/2020.
//

#ifndef UNTITLED_CONNECTION_HANDLER_HPP
#define UNTITLED_CONNECTION_HANDLER_HPP


#include <netinet/in.h>
#include <chrono>
#include <thread>
#include <array>
#include <utility>
#include "connection-lost-during-read-exception.hpp"
#include "header-handler.hpp"
#include "data-sender.hpp"
#include "data-reader.hpp"
#include "data-parser.hpp"
#include "../device/device.hpp"
#include "../security/security-module.hpp"

//class SendError : public std::runtime_error {
//public:
//    SendError() : std::runtime_error("Couldnt sendMessage the data. Aborting") {}
//};


class ConnectionHandler {
    int socketDescriptor;
    sockaddr_in clientAddress;
    std::shared_ptr<Device> device;
    DataSender sender;
    DataReader reader;
    DataParser dataParser;

    void handle() {
        auto requestData = reader.readAllData();
        auto parsedData = dataParser.parse(requestData.data);

        switch (parsedData.messageType) {
            case PING:
                sender.sendPing();
            case GET_TEMP:
                sender.sendCurrentTemperature(device->getCurrentTemperature());
            case CHANGE_TEMP: {
                device->setTargetTemperature(parsedData.targetTemp.value());
            }
            default:
                break;
        }

        destroy();
    }

    void destroy() {
        close(socketDescriptor);
        std::cout << "Closing connection with port " << ntohs(clientAddress.sin_port) << std::endl;
    }

public:
    ConnectionHandler(int socketDescriptor, struct sockaddr_in clientAddress, std::shared_ptr<SecurityModule> security)
            : socketDescriptor(socketDescriptor),
              clientAddress(clientAddress),
              sender(socketDescriptor, security),
              reader(socketDescriptor),
              dataParser(security) {}

    static void getConnectionHandler(int socketDescriptor, struct sockaddr_in clientAddress,
                                     std::shared_ptr<SecurityModule> security) {
        try {
            ConnectionHandler(socketDescriptor, clientAddress, std::move(security)).handle();
        } catch (const std::exception &e) {
            return;
        }
    }
};


#endif //UNTITLED_CONNECTION_HANDLER_HPP
