package pl.kejbi.tin.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.kejbi.tin.controller.dto.RegulatorDTO;
import pl.kejbi.tin.controller.dto.RegulatorUpdateDTO;
import pl.kejbi.tin.devices.LightDevice;
import pl.kejbi.tin.devices.Regulator;
import pl.kejbi.tin.devices.TemperatureDevice;
import pl.kejbi.tin.repository.RegulatorRepository;
import pl.kejbi.tin.security.KeyEncoder;
import pl.kejbi.tin.sender.RegulatorCommunicator;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RegulatorService {
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

        if(regulatorDTO.getType() != null) {
            regulator.setType(regulatorDTO.getType());
        }
        if(regulatorDTO.getName() != null) {
            regulator.setName(regulatorDTO.getName());
        }
        if(regulatorDTO.getPublicKey() != null) {
            regulator.setPublicKey(regulatorDTO.getPublicKey());
        }
        if(regulatorDTO.getAddress() != null) {
            regulator.setHostname(regulatorDTO.getAddress());
        }
        if(regulatorDTO.getPort() != null) {
            regulator.setPort(regulatorDTO.getPort());
        }

        regulatorRepository.save(regulator);
    }

    public void sendCurrData() throws IllegalBlockSizeException, InvalidKeyException, BadPaddingException, IOException, InvalidKeySpecException, NoSuchAlgorithmException {
        var regulators = regulatorRepository.findAll();
        for(Regulator regulator: regulators) {
            regulatorCommunicator.sendCurrData(regulator);
        }
    }

    public void sendLightConfig(int regulatorId, List<LightDevice> devices) throws IllegalBlockSizeException, InvalidKeyException, BadPaddingException, IOException, InvalidKeySpecException, NoSuchAlgorithmException {
        Regulator regulator = regulatorRepository.findById(regulatorId).orElseThrow(RuntimeException::new);
        regulatorCommunicator.sendLightChangeConfig(regulator, devices);
    }

    public void sendTemperatureConfig(int regulatorId, List<TemperatureDevice> devices) throws IllegalBlockSizeException, InvalidKeyException, BadPaddingException, IOException, InvalidKeySpecException, NoSuchAlgorithmException {
        Regulator regulator = regulatorRepository.findById(regulatorId).orElseThrow(RuntimeException::new);
        regulatorCommunicator.sendTemperatureChangeConfig(regulator, devices);
    }

    public void sendLightChangeParams(int regulatorId, LightDevice device) throws IllegalBlockSizeException, InvalidKeyException, BadPaddingException, IOException, InvalidKeySpecException, NoSuchAlgorithmException {
        Regulator regulator = regulatorRepository.findById(regulatorId).orElseThrow(RuntimeException::new);
        regulatorCommunicator.sendLightChangeParams(regulator, device);
    }

    public void sendTemperatureChangeParams(int regulatorId, TemperatureDevice device) throws IllegalBlockSizeException, InvalidKeyException, BadPaddingException, IOException, InvalidKeySpecException, NoSuchAlgorithmException {
        Regulator regulator = regulatorRepository.findById(regulatorId).orElseThrow(RuntimeException::new);
        regulatorCommunicator.sendTemperatureChangeParams(regulator, device);
    }
}
