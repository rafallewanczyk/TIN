package pl.kejbi.tin.devices;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LightDevice extends Device {
    private boolean turnedOn;

    public LightDevice(int id, int port, boolean turnedOn) {
        super(id, port);
        this.turnedOn = turnedOn;
    }
}
