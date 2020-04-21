//
// Created by Jaroslaw Glegola on 21/04/2020.
//

#ifndef UNTITLED_HEADER_HANDLER_HPP
#define UNTITLED_HEADER_HANDLER_HPP

#include "connection-lost-during-read-exception.hpp"

struct Header {
private:
    [[nodiscard]] std::vector<char> intToBytes(int value) const {
        std::vector<char> bytes(4);
        std::memcpy(bytes.data(), &value, 4);

        return bytes;
    }

public:
    int protocolVersion;
    int contentSize;
    int senderId;

    [[nodiscard]] std::vector<char> toBytes() const {
        auto protocolVersionBytes = intToBytes(protocolVersion);
        auto contentSizeBytes = intToBytes(contentSize);
        auto senderIdBytes = intToBytes(senderId);

        std::vector<char> result(12);
        result.insert(result.end(), protocolVersionBytes.begin(), protocolVersionBytes.end());
        result.insert(result.end(), contentSizeBytes.begin(), contentSizeBytes.end());
        result.insert(result.end(), senderIdBytes.begin(), senderIdBytes.end());

        return result;
    }
};

class HeaderHandler {

    int bytesToInt(std::vector<char> bytes) {
        int value = *(reinterpret_cast<int *>(bytes.data()));

        std::cout << value << std::endl;

        return value;
    }


    void validate(Header header) {
        if (header.protocolVersion != PROTOCOL_VERSION)
            throw InvalidMessageHeaderException("Wrong protocol version");

        if (header.contentSize < 0)
            throw InvalidMessageHeaderException("Content size is negative.");
    }

public:
    const static inline int HEADER_SIZE = 12;
    const static inline int PROTOCOL_VERSION = 1;

    Header parseHeader(std::array<char, HEADER_SIZE> array) {
        int protocolVersion = bytesToInt(std::vector(array.begin(), array.begin() + 4));
        int contentSize = bytesToInt(std::vector(array.begin() + 4, array.begin() + 8));
        int senderId = bytesToInt(std::vector(array.begin() + 8, array.end()));

        auto header = Header{protocolVersion, contentSize, senderId};

        validate(header);

        return header;
    }

};

//HeaderHandler::HEADER_SIZE


#endif //UNTITLED_HEADER_HANDLER_HPP
