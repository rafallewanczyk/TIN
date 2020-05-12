//
// Created by Jaroslaw Glegola on 22/04/2020.
//

#ifndef UNTITLED_DEVICE_HANDLER_HPP
#define UNTITLED_DEVICE_HANDLER_HPP


#include <algorithm>
#include <thread>
#include <iostream>
#include "device.hpp"

class DeviceHandler {
    std::shared_ptr<Device> device;

public:
    explicit DeviceHandler(std::shared_ptr<Device> device) : device(std::move(device)) {}

    [[noreturn]] void operator()() {
        using namespace std::chrono_literals;

        while (true) {
            std::this_thread::sleep_for(2s);

            device->update();
            std::cout << "Current temperature: " << device->getCurrentTemperature() << std::endl;
            std::cout << "Target temperature: " << device->getTargetTemperature() << std::endl;
        }
    }
};


#endif //UNTITLED_DEVICE_HANDLER_HPP
