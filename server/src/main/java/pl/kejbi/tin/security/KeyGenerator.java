package pl.kejbi.tin.security;

import org.springframework.stereotype.Component;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;

@Component
public class KeyGenerator {

    private KeyPairGenerator keyPairGenerator;

    public KeyGenerator() throws NoSuchAlgorithmException, NoSuchProviderException {
        keyPairGenerator = KeyPairGenerator.getInstance("RSA");
    }

    public synchronized KeyPair generateKeyPair(int length) {
        keyPairGenerator.initialize(length);

        return keyPairGenerator.generateKeyPair();
    }
}
