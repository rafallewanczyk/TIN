//
// Created by Jaroslaw Glegola on 18/04/2020.
//

#include "../../../test/catch.hpp"
#include "../key-generator.hpp"
#include "../security-module.hpp"

class TestsFixture {
public:
    TestsFixture() {
        KeyGenerator().generateAndSaveKeys("key.public.rsa", "key.private.rsa");
    }
};

TEST_CASE_METHOD(TestsFixture, "should encrypt decrypted message", "[test][security-module]") {
    // given
    SecurityModule security("key.public.rsa");

    // when
    auto encryptedMessage = security.encrypt("Encrypted from test");

    // and
    auto decryptedMessage = security.decrypt(encryptedMessage);

    // then
    REQUIRE(decryptedMessage == "Encrypted from test");
}

TEST_CASE_METHOD(TestsFixture, "should verify signature", "[test][security-module]") {
    // given
    SecurityModule security("key.public.rsa");

    // and
    auto message = "Checking signature from test";

    // and
    auto signature = security.makeSignature(message);

    // when
    auto isSignatureCorrect = security.verifySignature(message, signature);

    // then
    REQUIRE(isSignatureCorrect);
    REQUIRE(signature != message);
}

TEST_CASE_METHOD(TestsFixture, "should not verify signature when message is different", "[test][security-module]") {
    // given
    SecurityModule security("key.public.rsa");

    // and
    auto message = "Checking signature from test";

    // and
    auto signature = security.makeSignature(message);

    // when
    auto isSignatureCorrect = security.verifySignature(message + std::string("."), signature);

    // then
    REQUIRE(!isSignatureCorrect);
}

TEST_CASE_METHOD(TestsFixture, "should not verify signature when signature is different", "[test][security-module]") {
    // given
    SecurityModule security("key.public.rsa");

    // and
    auto message = "Checking signature from test";

    // and
    auto signature = security.makeSignature(message);

    // when
    auto isSignatureCorrect = security.verifySignature(message, signature + std::string("."));

    // then
    REQUIRE(!isSignatureCorrect);
}
