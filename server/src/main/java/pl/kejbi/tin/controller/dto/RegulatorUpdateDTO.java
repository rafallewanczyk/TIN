package pl.kejbi.tin.controller.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import pl.kejbi.tin.devices.RegulatorType;

@Data
@NoArgsConstructor
public class RegulatorUpdateDTO {
    private String name;
    private String publicKey;
    private String address;
    private Integer port;
    private RegulatorType type;
}
