//
// Created by Jaroslaw Glegola on 19/04/2020.
//

#ifndef UNTITLED_CONNECTION_LOST_DURING_READ_EXCEPTION_HPP
#define UNTITLED_CONNECTION_LOST_DURING_READ_EXCEPTION_HPP


#include <stdexcept>
#include "../utils/errno-exception.hpp"

class ConnectionLostDuringReadException : public ErrnoException {
public:
    const static inline char *MESSAGE = "There was a problem with a connection during receiving connection";

    ConnectionLostDuringReadException() : ErrnoException(MESSAGE) {}
};

class NotEnoughDataException : public ErrnoException {
public:
    const static inline char *MESSAGE = "There was not enough data in the message payload";

    NotEnoughDataException() : ErrnoException(MESSAGE) {}
};

class InvalidMessageHeaderException : public ErrnoException {
public:
    const static inline char *INVALID_HEADER_MESSAGE = "The message header was invalid. ";

    explicit InvalidMessageHeaderException(const std::string &extraMessage = "")
            : ErrnoException(INVALID_HEADER_MESSAGE + extraMessage) {}
};

class InvalidMessageTypeException : public ErrnoException {
public:
    const static inline char *INVALID_HEADER_MESSAGE = "Type of the message was invalid";

    explicit InvalidMessageTypeException(const std::string &extraMessage = "")
            : ErrnoException(INVALID_HEADER_MESSAGE + extraMessage) {}
};

#endif //UNTITLED_CONNECTION_LOST_DURING_READ_EXCEPTION_HPP
