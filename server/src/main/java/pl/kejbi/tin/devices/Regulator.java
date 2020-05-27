package pl.kejbi.tin.devices;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.security.PublicKey;

@Data
@Document
@AllArgsConstructor
public class Regulator {
    @Id
    private int id;
    private String name;
    private String hostname;
    private int port;
    private String publicKey;
    private RegulatorType type;
    private StatusType status;
}
