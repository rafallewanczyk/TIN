package pl.kejbi.tin.sender;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pl.kejbi.tin.devices.LightDevice;
import pl.kejbi.tin.devices.TemperatureDevice;
import pl.kejbi.tin.security.Cryptography;
import pl.kejbi.tin.security.SignatureManager;
import pl.kejbi.tin.socket.Client;
import pl.kejbi.tin.socket.Protocol;
import pl.kejbi.tin.socket.builder.SocketBuilder;
import pl.kejbi.tin.socket.ResponseHandler;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.net.Socket;
import java.security.InvalidKeyException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.util.List;

@Component
@RequiredArgsConstructor
public class Sender {
    private final Cryptography cryptography;
    private final SignatureManager signatureManager;
    private final ResponseHandler responseHandler;

    public void sendTemperatureChangeConfig(int port, List<TemperatureDevice> devices) throws IOException {
        sendData(port, temperatureDevicesToByteArray(devices));
    }

    public void sendLightChangeConfig(int port, List<LightDevice> devices) throws IOException {
        sendData(port, lightDevicesToByteArray(devices));
    }

    private void sendData(int port, byte[] data) throws IOException {
//        byte[] encryptedData = cryptography.encryptData(data, receiverKey);
        byte[] wholeMessage = Protocol.messageWithHeader(data);
//        byte[] signature = signatureManager.getSignature(wholeMessage, myKey);
        ByteArrayOutputStream byteStream = new ByteArrayOutputStream();
        byteStream.write(wholeMessage);
//        byteStream.write(signature);

        Socket socket = new SocketBuilder().createSocket()
                .withHostname("127.0.0.1")
                .withPort(port)
                .build();
        Client client = new Client(socket,cryptography, responseHandler);

        client.sendMessage(byteStream.toByteArray());
    }

    private byte[] temperatureDevicesToByteArray(List<TemperatureDevice> temperatureDevices) throws IOException {
        ByteArrayOutputStream byteStream = new ByteArrayOutputStream();
        DataOutputStream dataOutputStream = new DataOutputStream(byteStream);
        dataOutputStream.write("CHANGE_CONFIG".getBytes());
        for(TemperatureDevice device: temperatureDevices) {
            dataOutputStream.writeInt(device.getId());
            dataOutputStream.writeInt(device.getPort());
            dataOutputStream.writeDouble(device.getTemperature());
        }

        return byteStream.toByteArray();
    }

    private byte[] lightDevicesToByteArray(List<LightDevice> lightDevices) throws IOException {
        ByteArrayOutputStream byteStream = new ByteArrayOutputStream();
        DataOutputStream dataOutputStream = new DataOutputStream(byteStream);
        dataOutputStream.write("CHANGE_CONFIG".getBytes());
        for(LightDevice device: lightDevices) {
            dataOutputStream.writeInt(device.getId());
            dataOutputStream.writeInt(device.getPort());
            dataOutputStream.writeShort(device.isTurnedOn() ? 1 : 0);
        }

        return byteStream.toByteArray();
    }
}
