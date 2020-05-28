package pl.kejbi.tin.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import pl.kejbi.tin.controller.dto.*;
import pl.kejbi.tin.devices.Device;
import pl.kejbi.tin.devices.LightDevice;
import pl.kejbi.tin.devices.TemperatureDevice;
import pl.kejbi.tin.service.DeviceService;
import pl.kejbi.tin.service.RegulatorService;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import java.io.IOException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SignatureException;
import java.security.spec.InvalidKeySpecException;
import java.util.List;

@RestController
@RequestMapping("/devices")
@RequiredArgsConstructor
public class DeviceController {
    private final DeviceService deviceService;
    private final RegulatorService regulatorService;

    @PostMapping
    public void addDevice(@RequestBody DeviceDTO deviceDTO) throws InvalidKeySpecException, NoSuchAlgorithmException, IllegalBlockSizeException, BadPaddingException, InvalidKeyException, IOException, InvalidAlgorithmParameterException, SignatureException {
        Device device = deviceDTO.convertToDevice();
        deviceService.addDevice(device);
        int regulatorId = device.getRegulatorId();
        if(device instanceof LightDevice) {
            regulatorService.sendLightConfig(regulatorId, deviceService.getLightDevicesByRegulatorId(regulatorId));
        }
        else {
            regulatorService.sendTemperatureConfig(regulatorId, deviceService.getTemperatureDevicesByRegulatorId(regulatorId));
        }
    }

    @DeleteMapping("/{id}")
    public void deleteDevice(@PathVariable Integer id) throws IllegalBlockSizeException, BadPaddingException, InvalidKeyException, IOException, InvalidKeySpecException, NoSuchAlgorithmException, InvalidAlgorithmParameterException, SignatureException {
        Device device = deviceService.deleteDevice(id);
        int regulatorId = device.getRegulatorId();
        if(device instanceof LightDevice) {
            regulatorService.sendLightConfig(regulatorId, deviceService.getLightDevicesByRegulatorId(regulatorId));
        }
        else {
            regulatorService.sendTemperatureConfig(regulatorId, deviceService.getTemperatureDevicesByRegulatorId(regulatorId));
        }
    }

    @PatchMapping("/{id}")
    public void updateDevice(@PathVariable Integer id, @RequestBody DeviceUpdateDTO deviceUpdateDTO) throws BadPaddingException, NoSuchAlgorithmException, IllegalBlockSizeException, IOException, InvalidKeyException, InvalidKeySpecException, InvalidAlgorithmParameterException, SignatureException {
        Device device = deviceService.updateDevice(id, deviceUpdateDTO);
        int regulatorId = device.getRegulatorId();
        if(device instanceof LightDevice) {
            regulatorService.sendLightConfig(regulatorId, deviceService.getLightDevicesByRegulatorId(regulatorId));
        }
        else {
            regulatorService.sendTemperatureConfig(regulatorId, deviceService.getTemperatureDevicesByRegulatorId(regulatorId));
        }
    }

    @PostMapping("/light/setTargetData")
    public void setLightTargetData(@RequestBody LightTargetDTO lightTargetData) throws IllegalBlockSizeException, BadPaddingException, InvalidKeyException, IOException, InvalidKeySpecException, NoSuchAlgorithmException, InvalidAlgorithmParameterException, SignatureException {
        LightDevice device = deviceService.setLightTarget(lightTargetData.getId(), lightTargetData.getTargetData());
        regulatorService.sendLightChangeParams(device.getRegulatorId(), device);
    }

    @PostMapping("/temperature/setTargetData")
    public void setTemperatureTargetData(@RequestBody TemperatureTargetDto temperatureTargetData) throws IllegalBlockSizeException, BadPaddingException, InvalidKeyException, IOException, InvalidKeySpecException, NoSuchAlgorithmException, InvalidAlgorithmParameterException, SignatureException {
        TemperatureDevice device = deviceService.setTemperatureTarget(temperatureTargetData.getId(), temperatureTargetData.getTargetData());
        regulatorService.sendTemperatureChangeParams(device.getRegulatorId(), device);
    }

    @GetMapping
    public List<DeviceWithDataDTO> getAllDevices() throws IllegalBlockSizeException, BadPaddingException, InvalidKeyException, IOException, InvalidKeySpecException, NoSuchAlgorithmException, InvalidAlgorithmParameterException, SignatureException {
        regulatorService.sendCurrData();

        return deviceService.getDevicesCurrentData();
    }
}
