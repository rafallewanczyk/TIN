//
// Created by Jaroslaw Glegola on 14/04/2020.
//

#ifndef UNTITLED_ACCEPT_CONNECTION_EXCEPTION_HPP
#define UNTITLED_ACCEPT_CONNECTION_EXCEPTION_HPP

#include <stdexcept>
#include <string>


class AcceptConnectionException : public std::runtime_error {
private:
    static inline const std::string MESSAGE = "There was a problem with establishing a connection: ";

public:
    explicit AcceptConnectionException(const std::string &extraInfo) : std::runtime_error(MESSAGE + extraInfo) {}
};

#endif //UNTITLED_ACCEPT_CONNECTION_EXCEPTION_HPP
