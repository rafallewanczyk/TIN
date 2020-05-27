package pl.kejbi.tin.controller.dto;

import lombok.Data;

@Data
public class DeviceUpdateDTO {
    private String name;
    private String publicKey;
    private String address;
    private Integer port;
    private Integer regulatorId;
}
