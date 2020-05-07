package pl.kejbi.tin.security;

import org.springframework.stereotype.Component;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;

@Component
public class KeyGenerator {

    private KeyPairGenerator keyPairGenerator;

    public KeyGenerator() throws NoSuchAlgorithmException {
        keyPairGenerator = KeyPairGenerator.getInstance("RSA");
    }

    public synchronized KeyPair generateKeyPair(int length) throws NoSuchAlgorithmException {
        keyPairGenerator = KeyPairGenerator.getInstance("RSA");
        keyPairGenerator.initialize(length);

        return keyPairGenerator.generateKeyPair();
    }
}
