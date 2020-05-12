//
// Created by Jaroslaw Glegola on 19/04/2020.
//

#ifndef UNTITLED_CONNECTION_EXCEPTIONS_HPP
#define UNTITLED_CONNECTION_EXCEPTIONS_HPP


#include <stdexcept>
#include "../utils/errno-exception.hpp"

class ConnectionException : public ErrnoException {
public:
    ConnectionException(const std::string &message) : ErrnoException(message) {}
};

class ConnectionLostDuringReadException : public ConnectionException {
public:
    const static inline char *MESSAGE = "There was a problem with a connection during receiving connection";

    ConnectionLostDuringReadException() : ConnectionException(MESSAGE) {}
};

class ConnectionLostDuringSendException : public ConnectionException {
public:
    const static inline char *MESSAGE = "There was a problem with a connection during sending information back";

    ConnectionLostDuringSendException() : ConnectionException(MESSAGE) {}
};

#endif //UNTITLED_CONNECTION_EXCEPTIONS_HPP
