package pl.kejbi.tin.security;

import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.stereotype.Component;

import java.security.*;
import java.security.spec.MGF1ParameterSpec;
import java.security.spec.PSSParameterSpec;

@Component
public class SignatureManager {
    private Signature signature;

    public SignatureManager() throws NoSuchAlgorithmException, InvalidAlgorithmParameterException {
        Security.addProvider(new BouncyCastleProvider());
        signature = Signature.getInstance("SHA256withRSA/PSS");
        signature.setParameter(new PSSParameterSpec("SHA-256", "MGF1", MGF1ParameterSpec.SHA256, 0, 1));
    }

    public synchronized byte[] getSignature(byte[] message, PrivateKey key) throws InvalidKeyException, SignatureException {
        signature.initSign(key);
        signature.update(message);

        return signature.sign();
    }

    public boolean verifySignature(byte[] message, PublicKey key, byte[] sign) throws InvalidKeyException, SignatureException {
        signature.initVerify(key);
        signature.update(message);

        return signature.verify(sign);
    }
}
