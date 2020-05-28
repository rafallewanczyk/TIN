//
// Created by Jaroslaw Glegola on 21/04/2020.
//

#ifndef UNTITLED_DATA_SENDER_HPP
#define UNTITLED_DATA_SENDER_HPP


#include <string>
#include <utility>
#include <algorithm>
#include "../security/security-module.hpp"
#include "data-parser.hpp"

enum OutputMessageType {
    CURR_TEMP,
    PING_RETURN,
    ERROR
};

class DataSender {
    int socketDescriptor;
    std::shared_ptr<SecurityModule> security;
    const static inline int DOUBLE_SIZE = 8;

    std::string messageTypeToString(OutputMessageType type) {
        switch (type) {
            case CURR_TEMP:
                return "CURR_TEMP";
            case PING_RETURN:
                return "PING_RETURN";
            case ERROR:
                return "ERROR";
        }
    }

    Header buildHeader(const std::string &message, int signatureSize) {
        return {HeaderHandler::PROTOCOL_VERSION,
                HeaderHandler::HEADER_SIZE + int(message.size()) + signatureSize,
                0}; //what about device id?
    }

    std::vector<char> buildMessage(const std::vector<char> &message) {
        auto messageBytes = security->encrypt(std::string(message.begin(), message.end()));
        auto signature = security->makeSignature(messageBytes);
        auto headerBytes = buildHeader(messageBytes, signature.size()).toBytes();

        std::vector<char> wholeMessage;

        wholeMessage.insert(wholeMessage.end(), headerBytes.begin(), headerBytes.end());
        wholeMessage.insert(wholeMessage.end(), messageBytes.begin(), messageBytes.end());
        wholeMessage.insert(wholeMessage.end(), signature.begin(), signature.end());

        return wholeMessage;
    }

public:
    explicit DataSender(int socketDescriptor, std::shared_ptr<SecurityModule> security)
            : socketDescriptor(socketDescriptor), security(std::move(security)) {}

    void sendMessage(const std::vector<char> &message) {
        auto bytesToSend = buildMessage(message);

        if (send(socketDescriptor, bytesToSend.data(), bytesToSend.size(), 0) < 0) {
            throw ConnectionLostDuringSendException();
        }
    }

    void sendPing() {
        auto messageType = messageTypeToString(PING_RETURN);

        sendMessage(std::vector<char>(messageType.begin(), messageType.end()));
    }

    void sendCurrentTemperature(double currentTemperature) {
        auto messageType = messageTypeToString(CURR_TEMP);
        std::vector<char> message(messageType.size() + DOUBLE_SIZE);

        std::memcpy(message.data(), messageType.data(), messageType.size());
        std::memcpy(message.data() + messageType.size(), &currentTemperature, DOUBLE_SIZE);
        std::reverse(message.end() - DOUBLE_SIZE, message.end());

        sendMessage(message);
    }

    void sendError(const std::string &error) {
        auto messageType = messageTypeToString(ERROR);
        std::vector<char> message;

        message.insert(messageType.end(), messageType.begin(), messageType.end());
        message.insert(messageType.end(), error.begin(), error.end());

        sendMessage(message);
    }

};


#endif //UNTITLED_DATA_SENDER_HPP
