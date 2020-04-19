//
// Created by Jaroslaw Glegola on 18/04/2020.
//
#include "../../../test/catch.hpp"
#include "../device.hpp"

class TestsFixture {
public:
    TestsFixture() {}
};

TEST_CASE_METHOD(TestsFixture, "should not change the temperature when target temp is not set", "[test]") {
    // given
    auto device = Device();
    auto initialTemperature = device.getCurrentTemperature();

    // when
    device.update();
    device.update();
    device.update();

    // then
    REQUIRE(device.getCurrentTemperature() == initialTemperature);
}

TEST_CASE_METHOD(TestsFixture, "temperature should be higher after setting higher temperature and updating", "[test]") {
    // given
    auto device = Device();
    auto initialTemperature = device.getCurrentTemperature();

    // and
    device.setTargetTemperature(initialTemperature + 5);

    // when
    device.update();
    device.update();
    device.update();

    // then
    REQUIRE(device.getCurrentTemperature() >= initialTemperature);
}

TEST_CASE_METHOD(TestsFixture, "temperature should be raise faster after setting higher temperature", "[test]") {
    for (int i = 0; i < 100; i++) {
        // given
        auto device1 = Device();
        auto initialTemperature1 = device1.getCurrentTemperature();
        auto device2 = Device();
        auto initialTemperature2 = device2.getCurrentTemperature();

        // and
        device1.setTargetTemperature(initialTemperature1 - 5);
        device2.setTargetTemperature(initialTemperature2 + 25);

        // when
        device1.update();
        device1.update();
        device1.update();

        // and
        device2.update();
        device2.update();
        device2.update();

        // then
        REQUIRE(device2.getCurrentTemperature() >= device1.getCurrentTemperature());
    }
}
