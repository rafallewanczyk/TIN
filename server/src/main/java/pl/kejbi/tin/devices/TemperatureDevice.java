package pl.kejbi.tin.devices;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

import java.security.PublicKey;

@Getter
@Setter
@Document
@NoArgsConstructor
public class TemperatureDevice extends Device{
    private Double temperature;
    private Double currentData;

    public TemperatureDevice(int id, int port, String name, String host, String key, double temperature, int regulatorId, StatusType status) {
        super(id, port, name, host, key, regulatorId, status);
        this.temperature = temperature;
    }
}
