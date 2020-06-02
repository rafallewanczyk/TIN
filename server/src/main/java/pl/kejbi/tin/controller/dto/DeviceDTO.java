package pl.kejbi.tin.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import pl.kejbi.tin.devices.*;
import pl.kejbi.tin.security.KeyEncoder;

import javax.validation.constraints.NotNull;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DeviceDTO {
    @NotNull
    private int id;
    @NotNull
    private int regulatorId;
    @NotNull
    private String name;
    @NotNull
    private String publicKey;
    @NotNull
    private String address;
    @NotNull
    private int port;
    @NotNull
    private RegulatorType type;
    private StatusType status;

    public DeviceDTO(Device device) {
        this.id = device.getId();
        this.regulatorId = device.getRegulatorId();
        this.name = device.getName();
        this.publicKey = device.getPublicKey();
        this.address = device.getHostname();
        this.port = device.getPort();
        this.type = device instanceof LightDevice ? RegulatorType.LIGHT : RegulatorType.TEMPERATURE;
        this.status = device.getStatus();
    }

    public Device convertToDevice() throws InvalidKeySpecException, NoSuchAlgorithmException {
        if(type == RegulatorType.TEMPERATURE) {
            return new TemperatureDevice(id, port, name, address, publicKey, 20.5, regulatorId, StatusType.INACTIVE, false);
        }
        else {
            return new LightDevice(id, port, name, address, publicKey, false, regulatorId, StatusType.INACTIVE, false);
        }
    }
}
