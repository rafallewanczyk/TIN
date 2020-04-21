//
// Created by Jaroslaw Glegola on 21/04/2020.
//

#ifndef UNTITLED_DATA_SENDER_HPP
#define UNTITLED_DATA_SENDER_HPP


#include <string>

class DataSender {
    int socketDescriptor;
public:
    explicit DataSender(int socketDescriptor) : socketDescriptor(socketDescriptor) {}

    void send(const std::string& message, bool encrypted = true) {

    }

};


#endif //UNTITLED_DATA_SENDER_HPP
