//
// Created by Jaroslaw Glegola on 21/04/2020.
//

#ifndef UNTITLED_HEADER_HANDLER_HPP
#define UNTITLED_HEADER_HANDLER_HPP

#include "connection-exceptions.hpp"
#include "invalid-data-exceptions.hpp"
#include <algorithm>    // std::reverse


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
    std::vector<char> rawData;

    [[nodiscard]] std::vector<char> toBytes() const {
        auto protocolVersionBytes = intToBytes(protocolVersion);
        auto contentSizeBytes = intToBytes(contentSize);
        auto senderIdBytes = intToBytes(senderId);

        std::vector<char> result;
        result.insert(result.end(), protocolVersionBytes.begin(), protocolVersionBytes.end());
        result.insert(result.end(), contentSizeBytes.begin(), contentSizeBytes.end());
        result.insert(result.end(), senderIdBytes.begin(), senderIdBytes.end());

        return result;
    }
};

class HeaderHandler {

    int bytesToInt(std::vector<char> bytes) {
        std::reverse(bytes.begin(), bytes.end());
        int value = *(reinterpret_cast<int *>(bytes.data()));

        return value;
    }

    void validate(const Header &header) {
        if (header.contentSize < 0)
            throw InvalidMessageHeaderException("Content size is negative.");
    }

public:
    const static inline int HEADER_SIZE = 12;
    const static inline int PROTOCOL_VERSION = 1;

    Header parseHeader(std::vector<char> headerBytes) {
        if (headerBytes.size() < HEADER_SIZE)
            throw InvalidMessageHeaderException("Header was too short");

        int protocolVersion = bytesToInt(std::vector(headerBytes.begin(), headerBytes.begin() + 4));
        int contentSize = bytesToInt(std::vector(headerBytes.begin() + 4, headerBytes.begin() + 8));
        int senderId = bytesToInt(std::vector(headerBytes.begin() + 8, headerBytes.end()));

        auto header = Header{protocolVersion, contentSize, senderId,
                             std::vector<char>(headerBytes.begin(), headerBytes.end())};

        validate(header);

        return header;
    }

};

#endif //UNTITLED_HEADER_HANDLER_HPP
