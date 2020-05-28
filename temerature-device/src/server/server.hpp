//
// Created by Jaroslaw Glegola on 13/04/2020.
//

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wmissing-noreturn"
#ifndef UNTITLED_SERVER_HPP
#define UNTITLED_SERVER_HPP


#include <string>
#include <sys/socket.h>
#include <cstdio>
#include <cstdlib>
#include <unistd.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <string>
#include <iostream>
#include <thread>
#include <vector>
#include <memory>
#include "socket-initialisation-exception.hpp"
#include "accept-connection-exception.hpp"
#include "../security/security-module.hpp"
#include "../device/device.hpp"

using ConnectionThreadHanlder = std::function<void(int, struct sockaddr_in, std::shared_ptr<SecurityModule>,
                                                   std::shared_ptr<Device>)>;

class Server {
private:
    int socketDescriptor{}, port;
    struct sockaddr_in serverAddressStruct{};
    std::shared_ptr<SecurityModule> security = std::make_shared<SecurityModule>("Artur_klucz.public");

    static std::string getError() {
        return "Errno: " + std::to_string(errno) + " - " + strerror(errno);
    }

    void initSocket() {
        socketDescriptor = socket(AF_INET, SOCK_STREAM, 0);

        if (socketDescriptor < 0)
            throw SocketInitialisationException("Socket could not be created. " + getError());
    }

    void clearAddressStructs() {
        bzero((char *) &serverAddressStruct, sizeof(serverAddressStruct));
    }

    void bindAddress() {
        auto invertedPort = htons(port);

        clearAddressStructs();

        serverAddressStruct.sin_family = AF_INET;
        serverAddressStruct.sin_addr.s_addr = INADDR_ANY;
        serverAddressStruct.sin_port = invertedPort;

        if (bind(socketDescriptor, (struct sockaddr *) &serverAddressStruct, sizeof(serverAddressStruct)) < 0) {
            throw SocketInitialisationException(
                    "Could not bind to specified port" + std::to_string(port) + ", because of" + getError());
        }
    }

    std::pair<int, struct sockaddr_in> acceptConnection() {
        struct sockaddr_in clientAddress{};
        auto clientAddressLength = sizeof(clientAddress);
        auto newSocketDescriptor = accept(socketDescriptor,
                                          reinterpret_cast<struct sockaddr *>(&clientAddress),
                                          reinterpret_cast<socklen_t *>(&clientAddressLength));

        if (newSocketDescriptor < 0) {
            throw AcceptConnectionException(getError());
        }

        std::cout << "Connection was established on address: "
                  << inet_ntoa(clientAddress.sin_addr)
                  << " and port: "
                  << ntohs(clientAddress.sin_port)
                  << std::endl;

        return std::make_pair(newSocketDescriptor, clientAddress);
    }

public:
    ~Server() {
        std::cout << "Stopping server" << std::endl;
        close(socketDescriptor);
    }

    explicit Server(const std::string &port) : port(std::stoi(port)) {
        initSocket();
    }

    void run(const ConnectionThreadHanlder &handler, std::shared_ptr<Device> device, int maxBacklogSize = 18) {
        bindAddress();
        listen(socketDescriptor, maxBacklogSize);
        std::cout << "Listening on port: " << port << "." << std::endl;

        while (true) {
            try {
                auto clientConnectionInfo = acceptConnection();

                std::thread(handler, clientConnectionInfo.first, clientConnectionInfo.second, security,
                            std::ref(device)).detach();
            } catch (AcceptConnectionException &e) {
                std::cout << e.what() << std::endl;
                continue;
            }
        }
    }

};


#endif //UNTITLED_SERVER_HPP

#pragma clang diagnostic pop