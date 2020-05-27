package pl.kejbi.tin.devices;

import lombok.*;
import org.springframework.data.annotation.Id;

import java.security.PublicKey;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public abstract class Device {
    @Id
    private int id;
    private int port;
    private String name;
    private String hostname;
    private String publicKey;
    private int regulatorId;
    private StatusType status;
}
