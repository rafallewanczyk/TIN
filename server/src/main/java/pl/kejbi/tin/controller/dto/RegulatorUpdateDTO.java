package pl.kejbi.tin.controller.dto;

import lombok.Data;
import pl.kejbi.tin.devices.RegulatorType;

@Data
public class RegulatorUpdateDTO {
    private String name;
    private String publicKey;
    private String address;
    private Integer port;
    private RegulatorType type;
}
