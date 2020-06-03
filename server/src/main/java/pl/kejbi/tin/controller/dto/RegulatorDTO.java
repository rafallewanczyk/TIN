package pl.kejbi.tin.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import pl.kejbi.tin.devices.Regulator;
import pl.kejbi.tin.devices.RegulatorType;
import pl.kejbi.tin.devices.StatusType;
import pl.kejbi.tin.security.KeyEncoder;

import javax.validation.constraints.NotNull;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class RegulatorDTO {
    @NotNull
    private int id;
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
        this.id = regulator.getId();
        this.name = regulator.getName();
        this.publicKey = regulator.getPublicKey();
        this.address = regulator.getHostname();
        this.port = regulator.getPort();
        this.type = regulator.getType();
        this.status = regulator.getStatus();
    }

    public Regulator convertToRegulator() {
        return new Regulator(id, name, address, port, publicKey, type, StatusType.INACTIVE);
    }
}
