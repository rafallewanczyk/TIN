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
#include "connection-exceptions.hpp"
#include "header-handler.hpp"
#include "data-sender.hpp"
#include "data-reader.hpp"
#include "data-parser.hpp"
#include "../device/device.hpp"
#include "../security/security-module.hpp"

class ConnectionHandler {
    int socketDescriptor;
    sockaddr_in clientAddress;
    std::shared_ptr<Device> device;
    std::shared_ptr<SecurityModule> security;
    DataSender sender;
    DataReader reader;
    DataParser dataParser;

    void verifySignature(const std::string &body) {
        if (!security->verifySignature(body)) {
            throw SignatureNotVerified();
        }
    }

    void handleData() {
        auto body = reader.readAllData();
        verifySignature(body);
        auto parsedData = dataParser.parse(body);

        switch (parsedData.messageType) {
            case PING:
                sender.sendPing();
                break;
            case GET_TEMP:
                sender.sendCurrentTemperature(device->getCurrentTemperature());
                break;
            case CHANGE_TEMP: {
                device->setTargetTemperature(parsedData.targetTemp.value());
                break;
            }
        }
    }

    void handle() {
        try {
            handleData();
        } catch (const ConnectionException &e) {
        } catch (const InvalidMessageHeaderException &e) {
            std::cout << e.what() << std::endl;
        } catch (const InvalidDataException &e) {
            std::cout << e.what() << std::endl;
            sender.sendError(e.what());
        } catch (const std::exception &e) {
            std::cout << e.what() << std::endl;
        }

        destroy();
    }

    void destroy() {
        close(socketDescriptor);
        std::cout << "Closing connection with port " << ntohs(clientAddress.sin_port) << std::endl;
    }

public:
    ConnectionHandler(int socketDescriptor, struct sockaddr_in clientAddress, std::shared_ptr<SecurityModule> security,
                      std::shared_ptr<Device> device)
            : socketDescriptor(socketDescriptor),
              clientAddress(clientAddress),
              sender(socketDescriptor, security),
              reader(socketDescriptor),
              dataParser(security),
              security(security),
              device(std::move(device)) {}

    static void getConnectionHandler(int socketDescriptor, struct sockaddr_in clientAddress,
                                     std::shared_ptr<SecurityModule> security,
                                     std::shared_ptr<Device> device) {
        ConnectionHandler(socketDescriptor, clientAddress, std::move(security), device).handle();
    }
};


#endif //UNTITLED_CONNECTION_HANDLER_HPP
