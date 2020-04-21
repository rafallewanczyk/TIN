//
// Created by Jaroslaw Glegola on 21/04/2020.
//

#ifndef UNTITLED_DATA_SENDER_HPP
#define UNTITLED_DATA_SENDER_HPP


#include <string>
#include <utility>
#include "../security/security-module.hpp"

class DataSender {
    int socketDescriptor;
    std::shared_ptr<SecurityModule> security;
    const static inline int DOUBLE_SIZE = 8;

    Header buildHeader(const std::string &message) {
        return {HeaderHandler::PROTOCOL_VERSION, HeaderHandler::HEADER_SIZE + int(message.size()), 0};
    }

    std::vector<char> buildMessage(const std::string &message) {
        auto encryptedMessage = security->encrypt(message);
        auto headerBytes = buildHeader(encryptedMessage).toBytes();

        std::vector<char> wholeMessage(headerBytes.size() + encryptedMessage.size());

        wholeMessage.insert(wholeMessage.end(), headerBytes.begin(), headerBytes.end());
        wholeMessage.insert(wholeMessage.end(), encryptedMessage.begin(), encryptedMessage.end());

        return wholeMessage;
    }

public:
    explicit DataSender(int socketDescriptor, std::shared_ptr<SecurityModule> security)
            : socketDescriptor(socketDescriptor), security(std::move(security)) {}

    void sendMessage(const std::string &message) {
        auto messageBytes = buildMessage(message);

        if (send(socketDescriptor, message.data(), message.size(), 0) < 0) {
            throw ConnectionLostDuringReadException(); // TODO
        }
    }

    void sendPing() {
        sendMessage("");
    }

    void sendCurrentTemperature(double currentTemperature) {
        std::array<char, DOUBLE_SIZE> temperatureBytes{};
        std::memcpy(temperatureBytes.data(), &currentTemperature, DOUBLE_SIZE);

        sendMessage(temperatureBytes.data());
    }
};


#endif //UNTITLED_DATA_SENDER_HPP
