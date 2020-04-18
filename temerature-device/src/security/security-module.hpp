//
// Created by Jaroslaw Glegola on 18/04/2020.
//

#ifndef UNTITLED_SECURITY_MODULE_HPP
#define UNTITLED_SECURITY_MODULE_HPP

#include <osrng.h>
#include <files.h>
#include <string>
#include "rsa.h"
#include "key-generator.hpp"


class SecurityModule {

    CryptoPP::RSA::PublicKey publicKey;
    CryptoPP::RSA::PrivateKey privateKey;

public:

    SecurityModule() {
        KeyGenerator generator;
        KeyPair keyPair;

        try {
            keyPair = generator.loadKeys();
        } catch (const CryptoPP::FileStore::OpenErr &err) {
            keyPair = generator.generateAndSaveKeys();
        }

        publicKey = keyPair.first;
        privateKey = keyPair.second;
    }

};


#endif //UNTITLED_SECURITY_MODULE_HPP
