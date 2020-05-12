//
// Created by Jaroslaw Glegola on 19/04/2020.
//

#ifndef UNTITLED_ERRNO_EXCEPTION_HPP
#define UNTITLED_ERRNO_EXCEPTION_HPP


#include <stdexcept>
#include <errno.h>
#include <cstring>
#include <string>

class ErrnoException : public std::runtime_error {
    static std::string getError() {
        return " Errno: " + std::to_string(errno) + " - " + strerror(errno);
    }

public:
    explicit ErrnoException(const std::string &extraInfo) : std::runtime_error(extraInfo + getError()) {
        std::cout << (extraInfo + getError()) << std::endl;
    }
};


#endif //UNTITLED_ERRNO_EXCEPTION_HPP
