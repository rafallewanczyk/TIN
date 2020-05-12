//
// Created by Jaroslaw Glegola on 18/04/2020.
//

#ifndef UNTITLED_KEY_GENERATOR_HPP
#define UNTITLED_KEY_GENERATOR_HPP

#include <osrng.h>
#include <files.h>
#include <string>
#include "rsa.h"

//using KeyPair = std::pair<CryptoPP::RSA::PublicKey, CryptoPP::RSA::PrivateKey>;
struct KeyPair {
    CryptoPP::RSA::PublicKey publicKey;
    CryptoPP::RSA::PrivateKey privateKey;
};

class KeyGenerator {

    inline static const std::string PUBLIC_KEY_FILENAME = "key.public.rsa";
    inline static const std::string PRIVATE_KEY_FILENAME = "key.private.rsa";
    inline static const int PRIVATE_KEY_SIZE = 2048;


    static void save(const std::string &filename, const CryptoPP::BufferedTransformation &bt) {
        CryptoPP::FileSink file(filename.c_str());

        bt.CopyTo(file);
        file.MessageEnd();
    }

    static void load(const std::string &filename, CryptoPP::BufferedTransformation &bt) {
        CryptoPP::FileSource file(filename.c_str(), true /*pumpAll*/);

        file.TransferTo(bt);
        bt.MessageEnd();
    }

    void savePublicKey(const std::string &filename, const CryptoPP::RSA::PublicKey &key) {
        CryptoPP::ByteQueue queue;
        key.Save(queue);

        save(filename, queue);
    }

    static void loadPublicKey(const std::string &filename, CryptoPP::RSA::PublicKey &key) {
        CryptoPP::ByteQueue queue;
        load(filename, queue);

        key.Load(queue);
    }

    static void savePrivateKey(const std::string &filename, const CryptoPP::RSA::PrivateKey &key) {
        CryptoPP::ByteQueue queue;
        key.Save(queue);

        save(filename, queue);
    }

    static void loadPrivateKey(const std::string &filename, CryptoPP::PrivateKey &key) {
        CryptoPP::ByteQueue queue;
        load(filename, queue);

        key.Load(queue);
    }


public:
    CryptoPP::RSA::PublicKey loadPublicKey(const std::string &keyFilename = PUBLIC_KEY_FILENAME) {
        CryptoPP::RSA::PublicKey publicKey;

        loadPublicKey(keyFilename, publicKey);

        return publicKey;
    }

    CryptoPP::RSA::PrivateKey loadPrivateKey(const std::string &keyFilename = PUBLIC_KEY_FILENAME) {
        CryptoPP::RSA::PrivateKey privateKey;

        loadPublicKey(keyFilename, privateKey);

        return privateKey;
    }

    KeyPair loadKeys(const std::string &publicKeyFilename = PUBLIC_KEY_FILENAME,
                     const std::string &privateKeyFilename = PRIVATE_KEY_FILENAME) {
        return {std::move(loadPublicKey(publicKeyFilename)), std::move(loadPrivateKey(privateKeyFilename))};
    }


    KeyPair generateAndSaveKeys(const std::string &publicKeyFilename = PUBLIC_KEY_FILENAME,
                                const std::string &privateKeyFilename = PRIVATE_KEY_FILENAME) {
        CryptoPP::AutoSeededRandomPool rng;
        CryptoPP::InvertibleRSAFunction params;
        params.GenerateRandomWithKeySize(rng, PRIVATE_KEY_SIZE);

        CryptoPP::RSA::PublicKey publicKey(params);
        CryptoPP::RSA::PrivateKey privateKey(params);

        savePublicKey(publicKeyFilename, publicKey);
        savePrivateKey(privateKeyFilename, privateKey);

        return {std::move(publicKey), std::move(privateKey)};
    }
};


#endif //UNTITLED_KEY_GENERATOR_HPP
