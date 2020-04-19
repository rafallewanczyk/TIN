//
// Created by Jaroslaw Glegola on 19/04/2020.
//

#ifndef UNTITLED_REGULATOR_KEYS_NOT_FOUND_HPP
#define UNTITLED_REGULATOR_KEYS_NOT_FOUND_HPP


#include <stdexcept>

class RegulatorKeysNotFound : public std::runtime_error {
public:
    explicit RegulatorKeysNotFound() : std::runtime_error("Couldnt find regulator public key in the directory.") {}
};


#endif //UNTITLED_REGULATOR_KEYS_NOT_FOUND_HPP
