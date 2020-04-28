//
// Created by Jaroslaw Glegola on 18/04/2020.
//

#ifndef UNTITLED_SECURITY_MODULE_HPP
#define UNTITLED_SECURITY_MODULE_HPP

#include <osrng.h>
#include <files.h>
#include <string>
#include <hex.h>
#include "rsa.h"
#include "key-generator.hpp"
#include "regulator-keys-not-found.hpp"

using namespace CryptoPP;


class SecurityModule {
    std::mutex mutex;
    KeyPair serverKeyPair;
    CryptoPP::RSA::PublicKey regulatorPublicKey;
    CryptoPP::AutoSeededRandomPool rng;

public:
    const inline static bool ENCRYPTION_MODE_OFF = true;
    const inline static int SIGNATURE_SIZE = ENCRYPTION_MODE_OFF ? 0 : 32;

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

    std::string decrypt(std::string messageToDecrypt) {
        std::lock_guard lock(mutex);

        if (ENCRYPTION_MODE_OFF) { // Only for debugging purpose
            return messageToDecrypt;
        }

        CryptoPP::RSAES_OAEP_SHA_Decryptor d(serverKeyPair.privateKey);
        std::string decryptedMessage;

        CryptoPP::StringSource ss2(messageToDecrypt, true,
                                   new CryptoPP::PK_DecryptorFilter(rng, d,
                                                                    new CryptoPP::StringSink(decryptedMessage)));
        return decryptedMessage;
    }

    std::string encrypt(const std::string &messageToEncrypt) {
        std::lock_guard lock(mutex);

        if (ENCRYPTION_MODE_OFF) { // Only for debugging purpose
            return messageToEncrypt;
        }

        CryptoPP::RSAES_OAEP_SHA_Encryptor e(regulatorPublicKey);
        std::string encryptedMessage;

        CryptoPP::StringSource ss1(messageToEncrypt, true,
                                   new CryptoPP::PK_EncryptorFilter(rng, e,
                                                                    new CryptoPP::StringSink(encryptedMessage)));

        return encryptedMessage;
    }

    std::string makeSignature(const std::vector<char> &messageToSign) {
        std::lock_guard lock(mutex);
        if (ENCRYPTION_MODE_OFF) { // Only for debugging purpose
            return "";
        }
        SHA256 hash;
        std::string signature;
        StringSource(std::string(messageToSign.begin(), messageToSign.end()), true,
                     new HashFilter(hash, new StringSink(signature)));

        return signature;
    }

    bool verifySignature(const std::string &message, const std::string &signature) {
        std::lock_guard lock(mutex);
        if(ENCRYPTION_MODE_OFF) {
            return true;
        }
        SHA256 hash;
        bool result;
        StringSource(signature + message, true, new HashVerificationFilter(hash,
                                                                           new ArraySink((byte *) &result,
                                                                                         sizeof(result))));

        return result;
    }

};


#endif //UNTITLED_SECURITY_MODULE_HPP
