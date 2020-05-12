//
// Created by Jaroslaw Glegola on 22/04/2020.
//

#ifndef UNTITLED_INVALID_DATA_EXCEPTIONS_HPP
#define UNTITLED_INVALID_DATA_EXCEPTIONS_HPP

#include <stdexcept>
#include <string>

class InvalidDataException : public std::runtime_error {
public:
    explicit InvalidDataException(const std::string &message) : std::runtime_error(message) {}
};

class NotEnoughDataException : public InvalidDataException {
public:
    const static inline char *MESSAGE = "There was not enough data in the message payload";

    NotEnoughDataException() : InvalidDataException(MESSAGE) {}
};

class InvalidMessageHeaderException : public InvalidDataException {
public:
    const static inline char *INVALID_HEADER_MESSAGE = "The message header was invalid. ";

    explicit InvalidMessageHeaderException(const std::string &extraMessage = "")
            : InvalidDataException(INVALID_HEADER_MESSAGE + extraMessage) {}
};

class InvalidMessageTypeException : public InvalidDataException {
public:
    const static inline char *INVALID_HEADER_MESSAGE = "Type of the message was invalid";

    explicit InvalidMessageTypeException(const std::string &extraMessage = "")
            : InvalidDataException(INVALID_HEADER_MESSAGE + extraMessage) {}
};

class SignatureNotVerified : public InvalidDataException {
public:
    const static inline char *INVALID_HEADER_MESSAGE = "Signature could not be verified";

    explicit SignatureNotVerified(const std::string &extraMessage = "")
            : InvalidDataException(INVALID_HEADER_MESSAGE + extraMessage) {}
};


#endif //UNTITLED_INVALID_DATA_EXCEPTIONS_HPP
