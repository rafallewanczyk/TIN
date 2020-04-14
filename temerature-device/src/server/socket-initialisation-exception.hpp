//
// Created by Jaroslaw Glegola on 14/04/2020.
//

#ifndef UNTITLED_SOCKET_INITIALISATION_EXCEPTION_HPP
#define UNTITLED_SOCKET_INITIALISATION_EXCEPTION_HPP


#include <stdexcept>
#include <string>

class SocketInitialisationException : public std::runtime_error {
private:
    static inline const std::string MESSAGE = "There was a problem during socket initialisation";

public:
    explicit SocketInitialisationException(const std::string &extraInfo) : std::runtime_error(MESSAGE + extraInfo) {}
};


#endif //UNTITLED_SOCKET_INITIALISATION_EXCEPTION_HPP
