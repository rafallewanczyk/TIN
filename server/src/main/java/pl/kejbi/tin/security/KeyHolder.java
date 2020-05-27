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

@Component
@Getter
public class KeyHolder {
    private PrivateKey myPrivateKey;
    private PublicKey myPublicKey;
    private Logger logger = LoggerFactory.getLogger(KeyHolder.class);

    @PostConstruct
    private void loadKeys() throws NoSuchAlgorithmException, IOException, InvalidKeySpecException {
        PrivateKey privateKey = KeyIO.loadPrivateKey("keys/privateKey.rsa");
        PublicKey publicKey = KeyIO.loadPublicKey("keys/publicKey.rsa");
        myPrivateKey = privateKey;
        myPublicKey = publicKey;
        logger.info("Successfully loaded keys");
    }
}
