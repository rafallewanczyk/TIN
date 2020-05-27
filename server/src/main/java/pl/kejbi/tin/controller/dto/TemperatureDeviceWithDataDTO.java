package pl.kejbi.tin.controller.dto;

import lombok.Data;
import pl.kejbi.tin.devices.RegulatorType;
import pl.kejbi.tin.devices.StatusType;
import pl.kejbi.tin.devices.TemperatureDevice;

@Data
public class TemperatureDeviceWithDataDTO implements DeviceWithDataDTO {
    private int id;
    private int regulatorId;
    private String name;
    private String address;
    private int port;
    private RegulatorType type;
    private StatusType status;
    private Double data;
    private Double targetData;

    public TemperatureDeviceWithDataDTO(TemperatureDevice device) {
        this.id = device.getId();
        this.regulatorId = device.getRegulatorId();
        this.name = device.getName();
        this.address = device.getHostname();
        this.port = device.getPort();
        this.type = RegulatorType.LIGHT;
        this.status = device.getStatus();
        this.data = status == StatusType.INACTIVE ? null : device.getCurrentData();
        this.targetData = status == StatusType.INACTIVE ? null :device.getTemperature();
    }
}
