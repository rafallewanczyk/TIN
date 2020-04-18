//
// Created by Jaroslaw Glegola on 18/04/2020.
//
#include <filesystem>
#include "../../../test/catch.hpp"
#include "../key-generator.hpp"

TEST_CASE("should generate keys when the keys are not in files", "[test]") {
    // given
    std::filesystem::remove("key.public.rsa");
    std::filesystem::remove("key.private.rsa");

    // and
    KeyGenerator generator;

    // when
    generator.generateAndSaveKeys();

    // and
    std::ifstream publicKeyFile("key.public.rsa");
    std::ifstream privateKeyFile("key.private.rsa");

    // then
    REQUIRE(publicKeyFile.is_open());
    REQUIRE(privateKeyFile.is_open());

    // cleanup
    publicKeyFile.close();
    privateKeyFile.close();
}

TEST_CASE("should load keys when keys are in the file directory", "[test]") {
    // given
    auto generatedPair = KeyGenerator().generateAndSaveKeys();

    // and
    KeyGenerator generator;

    // when
    auto keyPair = generator.loadKeys();

    // then
    REQUIRE(keyPair.first.GetPublicExponent() == generatedPair.first.GetPublicExponent());
    REQUIRE(keyPair.second.GetPublicExponent() == generatedPair.second.GetPublicExponent());
}

TEST_CASE("should throw when no files are found in directory", "[test]") {
    // when
    std::filesystem::remove("key.public.rsa");
    std::filesystem::remove("key.private.rsa");

    // then
    REQUIRE_THROWS_AS(KeyGenerator().loadKeys(), CryptoPP::FileStore::OpenErr);
}
