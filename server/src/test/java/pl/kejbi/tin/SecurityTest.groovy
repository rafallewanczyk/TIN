package pl.kejbi.tin

import pl.kejbi.tin.security.Cryptography
import pl.kejbi.tin.security.KeyGenerator
import pl.kejbi.tin.security.KeyIO
import pl.kejbi.tin.security.SignatureManager
import spock.lang.Specification

import java.security.KeyPair
import java.security.PrivateKey
import java.security.PublicKey

class SecurityTest extends Specification {

    def "should create file with public key"() {
        given:
        KeyGenerator keyGenerator = new KeyGenerator()
        KeyPair keyPair = keyGenerator.generateKeyPair(2048)

        when:
        KeyIO.writeKeyToFile("keys/privateKey.rsa", keyPair.getPrivate())

        then:
        "Created file with encoded public key"
    }

    def "should load correct public key"() {
        given:
        KeyGenerator keyGenerator = new KeyGenerator()
        KeyPair keyPair = keyGenerator.generateKeyPair(2048)

        when:
        KeyIO.writeKeyToFile("keys/publicKey", keyPair.getPublic())
        PublicKey key = KeyIO.loadPublicKey("keys/publicKey")

        then:
        key.equals(keyPair.getPublic())
    }

    def "should load correct private key"() {
        given:
        KeyGenerator keyGenerator = new KeyGenerator()
        KeyPair keyPair = keyGenerator.generateKeyPair(2048)

        when:
        KeyIO.writeKeyToFile("keys/privateKey.rsa", keyPair.getPrivate())
        PrivateKey key = KeyIO.loadPrivateKey("keys/privateKey.rsa")

        then:
        key.equals(keyPair.getPrivate())
    }

    def "should decrypted message be the same as before encryption"() {
        given:
        KeyGenerator keyGenerator = new KeyGenerator()
        KeyPair keyPair = keyGenerator.generateKeyPair(2048)
        Cryptography cryptography = new Cryptography()
        String message = "TOP SECRET"

        when:
        byte[] encryptedMessage = cryptography.encryptData(message.getBytes(), keyPair.getPublic())
        byte[] decryptedMessage = cryptography.decryptData(encryptedMessage, keyPair.getPrivate())

        then:
        message.equals(new String(decryptedMessage))
    }

    def "should return true when verifying signature"() {
        given:
        KeyGenerator keyGenerator = new KeyGenerator()
        Cryptography cryptography = new Cryptography()
        SignatureManager signatureManager = new SignatureManager(cryptography)
        KeyPair keyPair = keyGenerator.generateKeyPair(2048)
        byte[] message = "TOP SECRET".getBytes()

        when:
        byte[] signature = signatureManager.getSignature(message, keyPair.getPrivate())

        then:
        signatureManager.verifySignature(message, keyPair.getPublic(), signature)
    }
}
