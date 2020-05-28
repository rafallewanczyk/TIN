package pl.kejbi.tin.sender;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pl.kejbi.tin.devices.LightDevice;
import pl.kejbi.tin.devices.Regulator;
import pl.kejbi.tin.devices.TemperatureDevice;
import pl.kejbi.tin.security.Cryptography;
import pl.kejbi.tin.security.SignatureManager;
import pl.kejbi.tin.socket.Client;
import pl.kejbi.tin.socket.DataWithSignature;
import pl.kejbi.tin.socket.Protocol;
import pl.kejbi.tin.socket.builder.SocketBuilder;
import pl.kejbi.tin.socket.ResponseHandler;
import pl.kejbi.tin.socket.exceptions.IncorrectSignatureException;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.net.Socket;
import java.security.*;
import java.util.List;

@Component
@RequiredArgsConstructor
public class Communicator {
    private final Cryptography cryptography;
    private final SignatureManager signatureManager;
    private final ResponseHandler responseHandler;

    public DataWithSignature sendData(byte[] data, String hostname, int port, int timeout, PublicKey receiverKey, PrivateKey myKey) throws IOException, BadPaddingException, InvalidKeyException, IllegalBlockSizeException, InvalidAlgorithmParameterException, SignatureException {
        byte[] encryptedData = cryptography.encryptData(data, receiverKey);
        byte[] signature = signatureManager.getSignature(encryptedData, myKey);
        byte[] wholeMessage = Protocol.messageWithHeader(encryptedData);

        ByteArrayOutputStream byteStream = new ByteArrayOutputStream();
        byteStream.write(wholeMessage);
        byteStream.write(signature);

        Socket socket = new SocketBuilder().createSocket()
                .withHostname(hostname)
                .withPort(port)
                .withTimeout(timeout)
                .build();
        Client client = new Client(socket);

        return client.sendDataAndReceiveResponse(byteStream.toByteArray());
    }

    public void processResponse(DataWithSignature response, PublicKey receiverKey, PrivateKey myKey) throws BadPaddingException, InvalidKeyException, IllegalBlockSizeException, IOException, InvalidAlgorithmParameterException, SignatureException {
        if(!signatureManager.verifySignature(response.getData(), receiverKey, response.getSignature())) {
//            throw new IncorrectSignatureException();
        }
        byte[] decryptedData = cryptography.decryptData(response.getData(), myKey);
        responseHandler.handleResponse(decryptedData);
    }

}
