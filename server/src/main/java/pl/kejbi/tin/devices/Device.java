package pl.kejbi.tin.devices;

import lombok.*;

import java.security.PublicKey;

@Getter
@Setter
@AllArgsConstructor
public abstract class Device {
    private int id;
    private int port;
}
