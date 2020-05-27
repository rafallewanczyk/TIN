package pl.kejbi.tin.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import pl.kejbi.tin.devices.Regulator;
import pl.kejbi.tin.devices.RegulatorType;
import pl.kejbi.tin.devices.StatusType;
import pl.kejbi.tin.security.KeyEncoder;

import javax.validation.constraints.NotNull;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;

@AllArgsConstructor
@Data
public class RegulatorDTO {
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

    public RegulatorDTO(Regulator regulator) {
        this.regulatorId = regulator.getId();
        this.name = regulator.getName();
        this.publicKey = KeyEncoder.getStringKey(regulator.getPublicKey());
        this.address = regulator.getHostname();
        this.port = regulator.getPort();
        this.type = regulator.getType();
        this.status = regulator.getStatus();
    }

    public Regulator convertToRegulator() throws InvalidKeySpecException, NoSuchAlgorithmException {
        return new Regulator(regulatorId, name, address, port, KeyEncoder.getPublicKey(publicKey), type, status);
    }
}
