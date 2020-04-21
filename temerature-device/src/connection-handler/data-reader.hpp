//
// Created by Jaroslaw Glegola on 21/04/2020.
//

#ifndef UNTITLED_DATA_READER_HPP
#define UNTITLED_DATA_READER_HPP


class DataReader {
    const static inline int RECEIVE_BUFFER_SIZE = 5;
    int socketDescriptor;
    DataSender sender;
    HeaderHandler headerHandler;

public:
    explicit DataReader(int socketDescriptor) : socketDescriptor(socketDescriptor), sender(socketDescriptor) {}

    Header readHeader() {
        std::vector<char> result;
        std::array<char, HeaderHandler::HEADER_SIZE> receiveBuffer{};

        int receivedBytes = recv(socketDescriptor, receiveBuffer.data(), HeaderHandler::HEADER_SIZE, 0);
        if (receivedBytes < HeaderHandler::HEADER_SIZE) {
            sender.send(InvalidMessageHeaderException::INVALID_HEADER_MESSAGE);
            throw InvalidMessageHeaderException();
        }

        return headerHandler.parseHeader(receiveBuffer);
    }

    std::vector<char> readAllData() {
        std::vector<char> result;
        std::array<char, RECEIVE_BUFFER_SIZE> receiveBuffer{};

        auto header = readHeader();

        while (result.size() <= header.contentSize) {
            int receivedBytes = recv(socketDescriptor, receiveBuffer.data(), receiveBuffer.size() - 1, 0);

            if (receivedBytes > 0) {
                result.insert(result.begin(), receiveBuffer.data(), receiveBuffer.data() + receivedBytes);
            } else if (receivedBytes == 0) {
                throw NotEnoughDataException();
            } else {
                throw ConnectionLostDuringReadException();
            }
        }

        return result;
    }

};


#endif //UNTITLED_DATA_READER_HPP
