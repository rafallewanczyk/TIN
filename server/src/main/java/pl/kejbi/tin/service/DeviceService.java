package pl.kejbi.tin.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.kejbi.tin.controller.dto.DeviceUpdateDTO;
import pl.kejbi.tin.controller.dto.DeviceWithDataDTO;
import pl.kejbi.tin.controller.dto.LightDeviceWithDataDTO;
import pl.kejbi.tin.controller.dto.TemperatureDeviceWithDataDTO;
import pl.kejbi.tin.socket.exceptions.InvalidDataException;
import pl.kejbi.tin.devices.Device;
import pl.kejbi.tin.devices.LightDevice;
import pl.kejbi.tin.devices.StatusType;
import pl.kejbi.tin.devices.TemperatureDevice;
import pl.kejbi.tin.repository.LightDeviceRepository;
import pl.kejbi.tin.repository.TemperatureDeviceRepository;
import pl.kejbi.tin.security.KeyEncoder;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DeviceService {
    private final LightDeviceRepository lightDeviceRepository;
    private final TemperatureDeviceRepository temperatureDeviceRepository;
    private static final int OFFSET = 18;
    private static final int LIGHT_DATA_SIZE = 6;
    private static final int TEMPERATURE_DATA_SIZE = 12;

    public Device addDevice(Device device) throws InvalidKeyException, BadPaddingException, IllegalBlockSizeException, IOException {
        int regulatorId = device.getRegulatorId();
        if(device instanceof LightDevice) {
            return lightDeviceRepository.save((LightDevice)device);
        }
        else {
            return temperatureDeviceRepository.save((TemperatureDevice)device);
        }
    }

    public Device deleteDevice(int id) throws InvalidKeyException, BadPaddingException, IllegalBlockSizeException, IOException {
        Device device;
        if(lightDeviceRepository.findById(id).isPresent()) {
            device = lightDeviceRepository.findById(id).get();
            lightDeviceRepository.deleteById(id);
            return device;
        }
        else {
            device = temperatureDeviceRepository.findById(id).orElseThrow(RuntimeException::new);
            temperatureDeviceRepository.deleteById(id);
            return device;
        }
    }

    public Device updateDevice(int id, DeviceUpdateDTO deviceUpdateDTO) throws InvalidKeySpecException, NoSuchAlgorithmException, InvalidKeyException, BadPaddingException, IllegalBlockSizeException, IOException {
        Device device;
        if(lightDeviceRepository.findById(id).isPresent()) {
            device = lightDeviceRepository.findById(id).get();
        }
        else {
            device = temperatureDeviceRepository.findById(id).orElseThrow(RuntimeException::new);
        }


        if(deviceUpdateDTO.getName() != null) {
            device.setName(deviceUpdateDTO.getName());
        }
        if(deviceUpdateDTO.getRegulatorId() != null) {
            device.setRegulatorId(deviceUpdateDTO.getRegulatorId());
        }
        if(deviceUpdateDTO.getPublicKey() != null) {
            device.setPublicKey(deviceUpdateDTO.getPublicKey());
        }
        if(deviceUpdateDTO.getAddress() != null) {
            device.setHostname(deviceUpdateDTO.getAddress());
        }
        if(deviceUpdateDTO.getPort() != null) {
            device.setPort(deviceUpdateDTO.getPort());
        }

        return addDevice(device);
    }

    public LightDevice setLightTarget(int id, boolean target) throws InvalidKeyException, BadPaddingException, IllegalBlockSizeException, IOException {
        LightDevice device = lightDeviceRepository.findById(id).orElseThrow(RuntimeException::new);
        device.setTurnedOn(target);
        return lightDeviceRepository.save(device);
    }

    public TemperatureDevice setTemperatureTarget(int id, double target) throws InvalidKeyException, BadPaddingException, IllegalBlockSizeException, IOException {
        TemperatureDevice device = temperatureDeviceRepository.findById(id).orElseThrow(RuntimeException::new);
        device.setTemperature(target);
        return temperatureDeviceRepository.save(device);
    }

    public List<LightDevice> getLightDevicesByRegulatorId(int regulatorId) {
        return lightDeviceRepository.findAllByRegulatorId(regulatorId);
    }

    public List<TemperatureDevice> getTemperatureDevicesByRegulatorId(int regulatorId) {
        return temperatureDeviceRepository.findAllByRegulatorId(regulatorId);
    }

    public void updateLightCurrData(byte[] data) {
        ByteBuffer buffer = ByteBuffer.wrap(data, OFFSET, data.length - OFFSET);
        int bytesRemaining = data.length - OFFSET;
        if(bytesRemaining % LIGHT_DATA_SIZE != 0) {
            throw new InvalidDataException();
        }
        while(bytesRemaining > 0) {
            int id = buffer.getInt();
            short param = buffer.getShort();
            LightDevice device = lightDeviceRepository.findById(id).orElseThrow(RuntimeException::new);
            if(param == 2) {
                device.setCurrentData(null);
                device.setStatus(StatusType.INACTIVE);
            }
            else {
                device.setCurrentData(param == 1);
                device.setStatus(StatusType.ACTIVE);
            }
            lightDeviceRepository.save(device);
            bytesRemaining -= LIGHT_DATA_SIZE;
        }
    }

    public void updateTemperatureCurrData(byte[] data) {
        ByteBuffer buffer = ByteBuffer.wrap(data, OFFSET, data.length - OFFSET);
        int bytesRemaining = data.length - OFFSET;
        if(bytesRemaining % TEMPERATURE_DATA_SIZE != 0) {
            throw new InvalidDataException();
        }
        while(bytesRemaining > 0) {
            int id = buffer.getInt();
            double param = buffer.getDouble();
            TemperatureDevice device = temperatureDeviceRepository.findById(id).orElseThrow(RuntimeException::new);
            if(param == -300) {
                device.setCurrentData(null);
                device.setStatus(StatusType.INACTIVE);
            }
            else {
                device.setCurrentData(param);
                device.setStatus(StatusType.ACTIVE);
            }
            temperatureDeviceRepository.save(device);
            bytesRemaining -= TEMPERATURE_DATA_SIZE;
        }
    }

    public List<DeviceWithDataDTO> getDevicesCurrentData() throws InvalidKeyException, BadPaddingException, IllegalBlockSizeException, IOException {
        List<DeviceWithDataDTO> devices = new ArrayList<>();
        lightDeviceRepository.findAll().forEach(device -> devices.add(new LightDeviceWithDataDTO(device)));
        temperatureDeviceRepository.findAll().forEach(device -> devices.add(new TemperatureDeviceWithDataDTO(device)));

        return devices;
    }
}
