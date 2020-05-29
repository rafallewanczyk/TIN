package pl.kejbi.tin.service;

import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.stereotype.Service;
import pl.kejbi.tin.controller.dto.RegulatorUpdateDTO;
import pl.kejbi.tin.devices.Device;
import pl.kejbi.tin.devices.LightDevice;
import pl.kejbi.tin.devices.Regulator;
import pl.kejbi.tin.devices.RegulatorType;
import pl.kejbi.tin.devices.StatusType;
import pl.kejbi.tin.devices.TemperatureDevice;
import pl.kejbi.tin.repository.LightDeviceRepository;
import pl.kejbi.tin.repository.RegulatorRepository;
import pl.kejbi.tin.repository.TemperatureDeviceRepository;
import pl.kejbi.tin.sender.RegulatorCommunicator;
import pl.kejbi.tin.socket.exceptions.NoRegulatorConnectionException;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import java.io.IOException;
import java.net.ConnectException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SignatureException;
import java.security.spec.InvalidKeySpecException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RegulatorService {
    private final DeviceService deviceService;
    private final RegulatorRepository regulatorRepository;
    private final RegulatorCommunicator regulatorCommunicator;

    public void addRegulator(Regulator regulator) {
        regulatorRepository.save(regulator);
    }

    public void deleteRegulator(int id) {
        regulatorRepository.deleteById(id);
    }

    public List<Regulator> getAllRegulators() {
        return regulatorRepository.findAll();
    }

    public void updateRegulator(int id, RegulatorUpdateDTO regulatorDTO) throws InvalidKeySpecException, NoSuchAlgorithmException {
        Regulator regulator = regulatorRepository.findById(id).orElseThrow(RuntimeException::new);

        if (regulatorDTO.getType() != null) {
            regulator.setType(regulatorDTO.getType());
        }
        if (regulatorDTO.getName() != null) {
            regulator.setName(regulatorDTO.getName());
        }
        if (regulatorDTO.getPublicKey() != null) {
            regulator.setPublicKey(regulatorDTO.getPublicKey());
        }
        if (regulatorDTO.getAddress() != null) {
            regulator.setHostname(regulatorDTO.getAddress());
        }
        if (regulatorDTO.getPort() != null) {
            regulator.setPort(regulatorDTO.getPort());
        }

        regulatorRepository.save(regulator);
    }

    public void sendCurrData() throws IllegalBlockSizeException, InvalidKeyException, BadPaddingException, IOException, InvalidKeySpecException, NoSuchAlgorithmException, InvalidAlgorithmParameterException, SignatureException {
        var regulators = regulatorRepository.findAll();
        for (Regulator regulator : regulators) {
            try {
                if(regulator.getStatus() == StatusType.INACTIVE)
                    resetRegulatorConfiguration(regulator);
                regulatorCommunicator.sendCurrData(regulator);
                checkRegulatorStatus(regulator);
            } catch (NoRegulatorConnectionException | ConnectException ex) {
                setRegulatorToInactive(regulator);
            }
        }
    }

    public void sendLightConfig(int regulatorId, List<LightDevice> devices) throws IllegalBlockSizeException, InvalidKeyException, BadPaddingException, IOException, InvalidKeySpecException, NoSuchAlgorithmException, InvalidAlgorithmParameterException, SignatureException {
        Regulator regulator = regulatorRepository.findById(regulatorId).orElseThrow(RuntimeException::new);
        try {
            regulatorCommunicator.sendLightChangeConfig(regulator, devices);
            checkRegulatorStatus(regulator);
        } catch (NoRegulatorConnectionException | ConnectException ex) {
            setRegulatorToInactive(regulator);
        }
    }

    public void sendTemperatureConfig(int regulatorId, List<TemperatureDevice> devices) throws IllegalBlockSizeException, InvalidKeyException, BadPaddingException, IOException, InvalidKeySpecException, NoSuchAlgorithmException, InvalidAlgorithmParameterException, SignatureException {
        Regulator regulator = regulatorRepository.findById(regulatorId).orElseThrow(RuntimeException::new);
        try {
            regulatorCommunicator.sendTemperatureChangeConfig(regulator, devices);
            checkRegulatorStatus(regulator);
        } catch (NoRegulatorConnectionException | ConnectException ex) {
            setRegulatorToInactive(regulator);
        }
    }

    public void sendLightChangeParams(int regulatorId, LightDevice device) throws IllegalBlockSizeException, InvalidKeyException, BadPaddingException, IOException, InvalidKeySpecException, NoSuchAlgorithmException, InvalidAlgorithmParameterException, SignatureException {
        Regulator regulator = regulatorRepository.findById(regulatorId).orElseThrow(RuntimeException::new);
        try {
            regulatorCommunicator.sendLightChangeParams(regulator, device);
            checkRegulatorStatus(regulator);
        } catch (NoRegulatorConnectionException | ConnectException ex) {
            setRegulatorToInactive(regulator);
        }
    }

    public void sendTemperatureChangeParams(int regulatorId, TemperatureDevice device) throws IllegalBlockSizeException, InvalidKeyException, BadPaddingException, IOException, InvalidKeySpecException, NoSuchAlgorithmException, InvalidAlgorithmParameterException, SignatureException {
        Regulator regulator = regulatorRepository.findById(regulatorId).orElseThrow(RuntimeException::new);
        try {
            regulatorCommunicator.sendTemperatureChangeParams(regulator, device);
            checkRegulatorStatus(regulator);
        } catch (NoRegulatorConnectionException | ConnectException ex) {
            setRegulatorToInactive(regulator);
        }
    }

    private void checkRegulatorStatus(Regulator regulator) {
        if (regulator.getStatus() == StatusType.INACTIVE) {
            regulator.setStatus(StatusType.ACTIVE);
            regulatorRepository.save(regulator);
        }
    }

    @SneakyThrows
    private void resetRegulatorConfiguration(Regulator regulator) {
        if (regulator.getType() == RegulatorType.TEMPERATURE)
            sendTemperatureConfig(regulator.getId(), deviceService.getTemperatureDevicesByRegulatorId(regulator.getId()));
        if (regulator.getType() == RegulatorType.LIGHT)
            sendLightConfig(regulator.getId(), deviceService.getLightDevicesByRegulatorId(regulator.getId()));
    }

    private void setRegulatorToInactive(Regulator regulator) {
        regulator.setStatus(StatusType.INACTIVE);
        deviceService.setRegulatorsDevicesToInactive(regulator.getId(), regulator.getType());
        regulatorRepository.save(regulator);
    }
}
