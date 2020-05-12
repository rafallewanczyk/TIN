//
// Created by Jaroslaw Glegola on 23/04/2020.
//

#ifndef UNTITLED_DATA_PARSER_TEST_CPP
#define UNTITLED_DATA_PARSER_TEST_CPP

#include <unordered_map>
#include "../../../test/catch.hpp"
#include "../data-parser.hpp"

std::shared_ptr<SecurityModule> security;

class TestsFixture {
public:

    TestsFixture() {
        KeyGenerator().generateAndSaveKeys("key.public.rsa", "key.private.rsa");
        security = std::make_shared<SecurityModule>("key.public.rsa");
    }
};

std::vector<char> buildBytes(std::string message) {
    auto bytesToSend = std::vector<char>{};

    bytesToSend.insert(bytesToSend.end(), message.begin(), message.end());

    auto encryptedData = security->encrypt(std::string(bytesToSend.begin(), bytesToSend.end()));

    return {encryptedData.begin(), encryptedData.end()};
}

TEST_CASE_METHOD(TestsFixture, "should parse correct message type", "[test][parser]") {
    std::unordered_map<std::string, MessageType> cases = {
            {"GET_TEMP",            GET_TEMP},
            {"CHANGE_TEMPcccccccc", CHANGE_TEMP},
            {"PING",                PING}
    };
    for (auto const&[message, messageType] : cases) {
        // given
        auto bytesToSend = buildBytes(message);

        // when
        auto parsedData = DataParser(security).parse(bytesToSend);

        // then
        REQUIRE(parsedData.messageType == messageType);
    }
}

TEST_CASE_METHOD(TestsFixture, "should retrieve correct signature", "[test][parser]") {
    std::unordered_map<std::string, MessageType> cases = {
            {"GET_TEMP", GET_TEMP},
            {"PING",     PING}
    };
    for (auto const&[message, messageType] : cases) {
        std::string signature = "this is signature";

        // and
        auto bytesToSend = buildBytes(message + signature);

        // when
        auto parsedData = DataParser(security).parse(bytesToSend);

        // then
        REQUIRE(parsedData.signature == "this is signature");
    }
}

TEST_CASE_METHOD(TestsFixture, "should retrieve correct signature for CHANGE TEMP", "[test][parser]") {
    std::string signature = "this is signature";
    std::vector<char> doubleBytes = {'\0', '\0', '\0', '\0', '\0', '\0', '\0', '\0',};
    std::string doubleBytesString(doubleBytes.begin(), doubleBytes.end());

    // and
    auto bytesToSend = buildBytes("CHANGE_TEMP" + doubleBytesString + signature);

    // when
    auto parsedData = DataParser(security).parse(bytesToSend);

    // then
    REQUIRE(parsedData.signature == "this is signature");
}

TEST_CASE_METHOD(TestsFixture, "should retrieve correct double for CHANGE TEMP", "[test][parser]") {
    std::string signature = "this is signature";
    std::vector<char> doubleBytes = {'\0', '\0', '\0', '\0', '\0', '\0', '\0' + 25, '\0' + 64,};
    std::string doubleBytesString(doubleBytes.begin(), doubleBytes.end());

    // and
    auto bytesToSend = buildBytes("CHANGE_TEMP" + doubleBytesString + signature);

    // when
    auto parsedData = DataParser(security).parse(bytesToSend);

    // then
    REQUIRE(parsedData.targetTemp.value() == 6.25);
}

TEST_CASE_METHOD(TestsFixture, "should throw an error when message type is incorrect", "[test][parser]") {
    std::vector<std::string> cases = {"GETTEMPERATURE", "CHANGE_", "ping"};
    for (auto message:cases) {
        // when
        auto bytesToSend = buildBytes("GETTEMPERATURE");

        // expect
        REQUIRE_THROWS_AS(DataParser(security).parse(bytesToSend), InvalidMessageTypeException);
    }
}


#endif //UNTITLED_DATA_PARSER_TEST_CPP
