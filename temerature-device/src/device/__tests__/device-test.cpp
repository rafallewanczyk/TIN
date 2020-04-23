//
// Created by Jaroslaw Glegola on 18/04/2020.
//
#include "../../../test/catch.hpp"
#include "../device.hpp"

class TestsFixture {
public:
    TestsFixture() {}
};

TEST_CASE_METHOD(TestsFixture, "should change the temperature when target temp is not set", "[test]") {
    // given
    auto device = Device();
    auto initialTemperature = device.getCurrentTemperature();

    // when
    device.update();
    device.update();
    device.update();

    // then
    REQUIRE(device.getCurrentTemperature() != initialTemperature);
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
