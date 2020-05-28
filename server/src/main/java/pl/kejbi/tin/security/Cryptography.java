package pl.kejbi.tin.security;

import org.springframework.stereotype.Component;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.OAEPParameterSpec;
import javax.crypto.spec.PSource;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.*;
import java.security.spec.MGF1ParameterSpec;

@Component
public class Cryptography {

    private Cipher encryptCipher;
    private Cipher decryptCipher;
    private OAEPParameterSpec oaepParams = new OAEPParameterSpec("SHA-256", "MGF1", new MGF1ParameterSpec("SHA-256"), PSource.PSpecified.DEFAULT);
    private static final int ENCRYPT_BLOCK_SIZE = 100;
    private static final int DECRYPT_BLOCK_SIZE = 256;

    public Cryptography() throws NoSuchPaddingException, NoSuchAlgorithmException {
        encryptCipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
        decryptCipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
    }

    public synchronized byte[] decryptData(byte[] input, Key key) throws InvalidKeyException, BadPaddingException, IllegalBlockSizeException, InvalidAlgorithmParameterException, IOException {
        decryptCipher.init(Cipher.DECRYPT_MODE, key, oaepParams);

        return processCryptography(input, decryptCipher, DECRYPT_BLOCK_SIZE);
    }

    public synchronized byte[] encryptData(byte[] input, Key key) throws InvalidKeyException, BadPaddingException, IllegalBlockSizeException, InvalidAlgorithmParameterException, IOException {
        encryptCipher.init(Cipher.ENCRYPT_MODE, key, oaepParams);

        return processCryptography(input, encryptCipher, ENCRYPT_BLOCK_SIZE);
    }

    private byte[] processCryptography(byte[] input, Cipher cipher, int blockSize) throws IOException, BadPaddingException, IllegalBlockSizeException {
        ByteArrayInputStream dataToProcess = new ByteArrayInputStream(input);
        ByteArrayOutputStream processedData = new ByteArrayOutputStream();
        int bytesRemaining = input.length;
        while(bytesRemaining > 0) {
            byte[] block = dataToProcess.readNBytes(blockSize);
            processedData.write(cipher.doFinal(block));
            bytesRemaining -= blockSize;
        }

        return processedData.toByteArray();
    }
}
