//
// Created by Jaroslaw Glegola on 19/04/2020.
//

#ifndef UNTITLED_DEVICE_HPP
#define UNTITLED_DEVICE_HPP


#include <random>

class Device {
    double currentTemperature;
    double targetTemperature;
    double temperatureChangeRateCoefficient = 1.0 / 15.0;
    std::mutex mutex;
    std::random_device dev;
    std::mt19937 rng;
    std::uniform_real_distribution<double> generateInitialTemp;
    std::uniform_real_distribution<double> generateTemperatureChange;

    void updateTemperatureChange() {
        auto temperatureDifference = targetTemperature - currentTemperature;
        auto newChangeRate = temperatureDifference * temperatureChangeRateCoefficient;

        auto low = temperatureDifference < 0 ? newChangeRate : -0.3;
        auto high = temperatureDifference > 0 ? newChangeRate : 0.3;
        generateTemperatureChange = std::uniform_real_distribution<double>(low, high);
    }

public:
    Device() : rng(dev()), generateInitialTemp(15, 17), generateTemperatureChange(0, 0) {
        currentTemperature = generateInitialTemp(rng);
        targetTemperature = currentTemperature;
    }

    void setTargetTemperature(double newTemperature) {
        std::lock_guard lock(mutex);
        targetTemperature = newTemperature;

        updateTemperatureChange();
    }

    [[nodiscard]] double getCurrentTemperature() const {
        return currentTemperature;
    }

    [[nodiscard]] double getTargetTemperature() const {
        return targetTemperature;
    }

    void update() {
        std::lock_guard lock(mutex);
        currentTemperature += generateTemperatureChange(rng);
        updateTemperatureChange();
    }
};


#endif //UNTITLED_DEVICE_HPP
