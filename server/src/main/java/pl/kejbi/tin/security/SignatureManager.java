package pl.kejbi.tin.security;

import org.springframework.stereotype.Component;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import java.io.IOException;
import java.security.*;
import java.util.Arrays;

@Component
public class SignatureManager {
    private MessageDigest messageDigest;
    private Cryptography cryptography;

    public SignatureManager(Cryptography crypto) throws NoSuchAlgorithmException {
        messageDigest = MessageDigest.getInstance("SHA-256");
        cryptography = crypto;
    }

    public byte[] getSignature(byte[] message, PrivateKey key) throws BadPaddingException, InvalidKeyException, IllegalBlockSizeException, IOException, InvalidAlgorithmParameterException {
        byte[] binaryHash = messageDigest.digest(message);

        return cryptography.encryptData(binaryHash, key);
    }

    public boolean verifySignature(byte[] message, PublicKey key, byte[] signature) throws BadPaddingException, InvalidKeyException, IllegalBlockSizeException, IOException, InvalidAlgorithmParameterException {
        byte[] binaryHash = messageDigest.digest(message);
        byte[] decryptedSignature = cryptography.decryptData(signature, key);

        return Arrays.equals(binaryHash, decryptedSignature);
    }
}
