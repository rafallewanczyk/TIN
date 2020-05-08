package pl.kejbi.tin.devices;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.security.PublicKey;

@Getter
@Setter
public abstract class Device {
    private int id;
    private PublicKey publicKey;
}
