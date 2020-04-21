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
    CURR_TEMP,
    CHANGE_TEMP,
    PING_RETURN
};

struct ParsedData {
    MessageType messageType;
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
            case CURR_TEMP:
                return "CURR_TEMP";
            case CHANGE_TEMP:
                return "CHANGE_TEMP";
            case PING_RETURN:
                return "PING_RETURN";
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
//        auto encryptedData = security->encrypt(std::string(data.begin(), data.end())); // TODO change to encryptoin
        std::string stringData(data.begin(), data.end());
        auto messageType = parseMessageType(stringData);

        switch (messageType) {
            case PING:
                return {PING};
            case GET_TEMP:
                return {GET_TEMP};
            case CHANGE_TEMP: {
                auto typeOffset = messageTypeToString(CHANGE_TEMP).size();
                auto doubleData = stringData.substr(typeOffset);

                return {CHANGE_TEMP, parseDouble(doubleData)};
            }
            default:
                throw std::runtime_error("Undefined message type");
        }
    }

};


#endif //UNTITLED_DATA_PARSER_HPP
