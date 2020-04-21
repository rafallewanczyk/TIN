//
// Created by Jaroslaw Glegola on 21/04/2020.
//

#ifndef UNTITLED_HEADER_HANDLER_HPP
#define UNTITLED_HEADER_HANDLER_HPP

#include "connection-lost-during-read-exception.hpp"

struct Header {
    int protocolVersion;
    int contentSize;
    int senderId;
};

class HeaderHandler {
    const static inline int PROTOCOL_VERSION = 1;

    int bytesToInt(std::vector<char> bytes) {
        int value = *(reinterpret_cast<int *>(bytes.data()));

        std::cout << value << std::endl;

        return value;
    }

    std::vector<char> intToBytes(int value) {
        std::vector<char> bytes(4);
        std::memcpy(bytes.data(), &value, 4);

        return bytes;
    }

    void validate(Header header) {
        if (header.protocolVersion != PROTOCOL_VERSION)
            throw InvalidMessageHeaderException("Wrong protocol version");

        if(header.contentSize < 0)
            throw InvalidMessageHeaderException("Content size is negative.");
    }

public:
    const static inline int HEADER_SIZE = 12;

    Header parseHeader(std::array<char, HEADER_SIZE> array) {
        int protocolVersion = bytesToInt(std::vector(array.begin(), array.begin() + 4));
        int contentSize = bytesToInt(std::vector(array.begin() + 4, array.begin() + 8));
        int senderId = bytesToInt(std::vector(array.begin() + 8, array.end()));

        auto header = Header{protocolVersion, contentSize, senderId};

        validate(header);

        return header;
    }

    std::vector<char> headerToBytes(Header header) {
        auto protocolVersionBytes = intToBytes(header.protocolVersion);
        auto contentSizeBytes = intToBytes(header.contentSize);
        auto senderIdBytes = intToBytes(header.senderId);

        std::vector<char> result(12);
        result.insert( result.end(), protocolVersionBytes.begin(), protocolVersionBytes.end() );
        result.insert( result.end(), contentSizeBytes.begin(), contentSizeBytes.end() );
        result.insert( result.end(), senderIdBytes.begin(), senderIdBytes.end() );

        return result;
    }
};

//HeaderHandler::HEADER_SIZE


#endif //UNTITLED_HEADER_HANDLER_HPP
