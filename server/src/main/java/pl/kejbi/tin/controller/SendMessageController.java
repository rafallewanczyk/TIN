package pl.kejbi.tin.controller;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pl.kejbi.tin.devices.LightDevice;
import pl.kejbi.tin.devices.TemperatureDevice;
import pl.kejbi.tin.security.KeyHolder;
import pl.kejbi.tin.sender.Sender;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class SendMessageController {
    private final Sender sender;
    private final Logger logger = LoggerFactory.getLogger(SendMessageController.class);

    @PostMapping("/temp")
    public List<TemperatureDevice> sendTempChangeConfig(@RequestParam int port, @RequestParam int devicePort) throws IOException {
        List<TemperatureDevice> temperatureDevices = new ArrayList<>();
        temperatureDevices.add(new TemperatureDevice(1, devicePort, -150.5));
        temperatureDevices.add(new TemperatureDevice(2, 20002, 121.5));
//        temperatureDevices.add(new TemperatureDevice(3, 20004, 22.5));
//        temperatureDevices.add(new TemperatureDevice(4, 20005, 23.5));
        logger.info("Sending CHANGE_CONFIG TEMP");
        sender.sendTemperatureChangeConfig(port, temperatureDevices);
        logger.info("DONE SENDING");

        return temperatureDevices;
    }

    

    @PostMapping("/light")
    public List<LightDevice> sendLightChangeConfig(@RequestParam int port) throws IOException {
        List<LightDevice> lightDevices = new ArrayList<>();
        lightDevices.add(new LightDevice(1, 60000, true));
        lightDevices.add(new LightDevice(2, 60001, false));
        lightDevices.add(new LightDevice(3, 60002, true));
        lightDevices.add(new LightDevice(4, 60003, false));
        logger.info("Sending CHANGE_CONFIG LIGHT");
        sender.sendLightChangeConfig(port, lightDevices);
        logger.info("DONE SENDING");

        return lightDevices;
    }
}
