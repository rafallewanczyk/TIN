//
// Created by Jaroslaw Glegola on 18/04/2020.
//

#ifndef UNTITLED_SECURITY_MODULE_HPP
#define UNTITLED_SECURITY_MODULE_HPP

#include <osrng.h>
#include <files.h>
#include <string>
#include <hex.h>
#include <pssr.h>
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
    const inline static bool ENCRYPTION_MODE_OFF = false;
    const inline static int SIGNATURE_SIZE = ENCRYPTION_MODE_OFF ? 0 : 256;

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

    std::string decrypt(const std::string &messageToDecrypt) {
        std::lock_guard lock(mutex);

        if (ENCRYPTION_MODE_OFF) { // Only for debugging purpose
            return messageToDecrypt;
        }

        RSAES<OAEP<SHA256>>::Decryptor d(serverKeyPair.privateKey);

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

        RSAES<OAEP<SHA256>>::Encryptor e(regulatorPublicKey);
        std::string encryptedMessage;

        CryptoPP::StringSource ss1(messageToEncrypt, true,
                                   new CryptoPP::PK_EncryptorFilter(rng, e,
                                                                    new CryptoPP::StringSink(encryptedMessage)));

        return encryptedMessage;
    }

    std::string makeSignature(const std::string &messageToSign) {
        std::lock_guard lock(mutex);
        if (ENCRYPTION_MODE_OFF) { // Only for debugging purpose
            return "";
        }

        RSASS<PSS, SHA256>::Signer signer(serverKeyPair.privateKey);
        std::string signature;
        StringSource(messageToSign, true, new SignerFilter(rng, signer, new StringSink(signature)));

        return signature;
    }

    bool verifySignature(const std::string &message) {
        std::lock_guard lock(mutex);
        if (ENCRYPTION_MODE_OFF) {
            return true;
        }

        try {
            std::string recovered;
            RSASS<PSS, SHA256>::Verifier verifier(regulatorPublicKey);
            StringSource ss2(message, true,
                 new SignatureVerificationFilter(
                         verifier,
                         new StringSink(recovered),
                         SignatureVerificationFilter::THROW_EXCEPTION |
                         SignatureVerificationFilter::PUT_MESSAGE
                 )
            );
        }
        catch (...) {
            return false;
        }

        return true;
    }

};


#endif //UNTITLED_SECURITY_MODULE_HPP
