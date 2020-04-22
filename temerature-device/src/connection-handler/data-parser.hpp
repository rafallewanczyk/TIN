//
// Created by Jaroslaw Glegola on 21/04/2020.
//

#ifndef UNTITLED_DATA_PARSER_HPP
#define UNTITLED_DATA_PARSER_HPP


#include <string>
#include <utility>
#include <vector>

enum MessageType {
    PING,
    GET_TEMP,
    CHANGE_TEMP
};

struct ParsedData {
    MessageType messageType;
    std::string signature;
    std::optional<double> targetTemp = std::nullopt;
};

class DataParser {
    std::shared_ptr<SecurityModule> security;

    std::string messageTypeToString(MessageType type) {
        switch (type) {
            case GET_TEMP:
                return "GET_TEMP";
            case PING:
                return "PING";
            case CHANGE_TEMP:
                return "CHANGE_TEMP";
        }
    }

    std::optional<MessageType> parseType(MessageType type, const std::string &basicString) {
        auto typeRepresentation = messageTypeToString(type);

        if (basicString.size() < typeRepresentation.size())
            throw InvalidMessageTypeException("Type has invalid size");

        if (basicString.substr(0, typeRepresentation.size()) == typeRepresentation) {
            return std::make_optional(type);
        }

        return std::nullopt;
    }

    MessageType parseMessageType(const std::string &basicString) {
        if (parseType(PING, basicString))
            return PING;

        if (parseType(GET_TEMP, basicString))
            return GET_TEMP;

        if (parseType(CHANGE_TEMP, basicString))
            return CHANGE_TEMP;

        throw InvalidMessageTypeException("Type was not recognised");
    }

    double parseDouble(const std::string &bytes) {
        std::vector<char> b(bytes.begin(), bytes.end());
        double value = *(reinterpret_cast<double *>(b.data()));

        return value;
    }

public:
    explicit DataParser(std::shared_ptr<SecurityModule> security) : security(std::move(security)) {}

    ParsedData parse(const std::vector<char> &data) {
        auto decryptedData = security->decrypt(std::string(data.begin(), data.end()));
        auto messageType = parseMessageType(decryptedData);
        auto messageTypeSize = messageTypeToString(messageType).size();

        switch (messageType) {
            case PING:
            case GET_TEMP: {
                auto signature = decryptedData.substr(messageTypeSize);

                return {messageType, signature};
            }
            case CHANGE_TEMP: {
                auto doubleData = decryptedData.substr(messageTypeSize, 8);
                auto signature = decryptedData.substr(messageTypeSize + 8);

                return {CHANGE_TEMP, signature, parseDouble(doubleData)};
            }
        }
    }

};


#endif //UNTITLED_DATA_PARSER_HPP
