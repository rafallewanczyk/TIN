//
// Created by Jaroslaw Glegola on 18/04/2020.
//

#include "../../../test/catch.hpp"
#include "../key-generator.hpp"
#include "../security-module.hpp"

class TestsFixture {
public:
    TestsFixture() {
//        KeyGenerator().generateAndSaveKeys("regulator.public.rsa", "regulator.private.rsa");
        KeyGenerator().generateAndSaveKeys("key.public.rsa", "key.private.rsa");
    }
};

TEST_CASE_METHOD(TestsFixture, "should encrypt decrypted message", "[test]") {
    // given
    SecurityModule security("key.public.rsa");

    // when
    auto encryptedMessage = security.encrypt("Encrypted from test");

    // and
    auto decryptedMessage = security.decrypt(encryptedMessage);

    // then
    REQUIRE(decryptedMessage == "Encrypted from test");
}
