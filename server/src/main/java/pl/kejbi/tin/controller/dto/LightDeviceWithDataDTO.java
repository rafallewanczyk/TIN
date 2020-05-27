package pl.kejbi.tin.controller.dto;


import lombok.Data;
import pl.kejbi.tin.devices.LightDevice;
import pl.kejbi.tin.devices.RegulatorType;
import pl.kejbi.tin.devices.StatusType;

@Data
public class LightDeviceWithDataDTO implements DeviceWithDataDTO {
    private int id;
    private int regulatorId;
    private String name;
    private String address;
    private int port;
    private RegulatorType type;
    private StatusType status;
    private Boolean data;
    private Boolean targetData;

    public LightDeviceWithDataDTO(LightDevice device) {
        this.id = device.getId();
        this.regulatorId = device.getRegulatorId();
        this.name = device.getName();
        this.address = device.getHostname();
        this.port = device.getPort();
        this.type = RegulatorType.LIGHT;
        this.status = device.getStatus();
        this.data = device.getCurrentData();
        this.targetData = device.getTurnedOn();
    }
}
