package pl.kejbi.tin

import pl.kejbi.tin.security.KeyGenerator
import pl.kejbi.tin.security.KeyUtils
import spock.lang.Specification

import java.security.KeyPair
import java.security.PrivateKey
import java.security.PublicKey

class KeyTest extends Specification {

    def "should create file with public key"() {
        given:
        KeyPair keyPair = KeyGenerator.generateKeyPair(2048)

        when:
        KeyUtils.writeKeyToFile("keys/publicKey", keyPair.getPublic())

        then:
        "Created file with encoded public key"
    }

    def "should load correct public key"() {
        given:
        KeyPair keyPair = KeyGenerator.generateKeyPair(2048)

        when:
        KeyUtils.writeKeyToFile("keys/publicKey", keyPair.getPublic())
        PublicKey key = KeyUtils.loadPublicKey("keys/publicKey")

        then:
        key.equals(keyPair.getPublic())
    }

    def "should load correct private key"() {
        given:
        KeyPair keyPair = KeyGenerator.generateKeyPair(2048)

        when:
        KeyUtils.writeKeyToFile("keys/privateKey", keyPair.getPrivate())
        PrivateKey key = KeyUtils.loadPrivateKey("keys/privateKey")

        then:
        key.equals(keyPair.getPrivate())
    }
}
