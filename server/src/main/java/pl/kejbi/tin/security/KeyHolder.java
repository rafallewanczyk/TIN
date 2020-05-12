package pl.kejbi.tin.security;

import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.InvalidKeySpecException;
import java.util.HashMap;

@Component
@Getter
public class KeyHolder {
    private PrivateKey myPrivateKey;
    private PublicKey myPublicKey;
    private HashMap<Integer, PublicKey> devicesKeys = new HashMap<>();
    private Logger logger = LoggerFactory.getLogger(KeyHolder.class);

    @PostConstruct
    private void loadKeys() throws NoSuchAlgorithmException, IOException, InvalidKeySpecException {
        PrivateKey privateKey = KeyIO.loadPrivateKey("keys/privateKey");
        PublicKey publicKey = KeyIO.loadPublicKey("keys/publicKey");
        myPrivateKey = privateKey;
        myPublicKey = publicKey;
        logger.info("Successfully loaded keys");
    }

    public void addDevicePublicKey(int id, PublicKey key) {
        devicesKeys.put(id, key);
    }

    public PublicKey getDevicePublicKey(int id) {
        return devicesKeys.get(id);
    }
}
