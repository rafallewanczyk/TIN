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

class RegulatorKeysNotFound : public std::runtime_error {
public:
    RegulatorKeysNotFound() : std::runtime_error("Couldn't find regulator keys") {}
};

class SecurityModule {

    KeyPair serverKeyPair;
    CryptoPP::RSA::PublicKey regulatorPublicKey;
    CryptoPP::AutoSeededRandomPool rng;

public:

    SecurityModule(const std::string &regulatorPublicKeyFilename) {
        KeyGenerator generator;

        try {
            serverKeyPair = generator.loadKeys();
        } catch (const CryptoPP::FileStore::OpenErr &err) {
            serverKeyPair = generator.generateAndSaveKeys();
        }

        try {
            regulatorPublicKey = generator.loadPublicKey(regulatorPublicKeyFilename);
        } catch (const CryptoPP::FileStore::OpenErr &err) {
            throw RegulatorKeysNotFound();
        }
    }

    std::string decrypt(std::string cipher) {
        CryptoPP::RSAES_OAEP_SHA_Decryptor d(serverKeyPair.privateKey);
        std::string recovered;

        CryptoPP::StringSource ss2(cipher, true,
                                   new CryptoPP::PK_DecryptorFilter(rng, d, new CryptoPP::StringSink(recovered)));
        return recovered;
    }

    std::string encrypt(std::string x) {
        CryptoPP::RSAES_OAEP_SHA_Encryptor e(regulatorPublicKey);
        std::string cipher;

        CryptoPP::StringSource ss1(x, true, new CryptoPP::PK_EncryptorFilter(rng, e, new CryptoPP::StringSink(cipher)));

        return cipher;
    }

    std::string makeSignature(std::string) {
        return "";
    }

    bool verifySignature(std::string) {
        return false;
    }
};


#endif //UNTITLED_SECURITY_MODULE_HPP
