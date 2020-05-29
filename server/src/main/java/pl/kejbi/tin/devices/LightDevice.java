package pl.kejbi.tin.devices;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

import java.security.PublicKey;

@Getter
@Setter
@NoArgsConstructor
@Document
public class LightDevice extends Device {
    private Boolean turnedOn;
    private Boolean currentData;

    public LightDevice(int id, int port, String name, String host, String key, boolean turnedOn, int regulatorId, StatusType status, boolean reset) {
        super(id, port, host, name, key, regulatorId, status, reset);
        this.turnedOn = turnedOn;
        this.currentData = false;
    }
}
