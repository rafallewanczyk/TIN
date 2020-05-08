package pl.kejbi.tin.socket;

import lombok.Data;
import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pl.kejbi.tin.devices.LightDevice;
import pl.kejbi.tin.devices.TemperatureDevice;
import pl.kejbi.tin.security.Cryptography;
import pl.kejbi.tin.security.SignatureManager;
import pl.kejbi.tin.socket.exceptions.IncorrectMessageSizeException;
import pl.kejbi.tin.socket.exceptions.IncorrectSignatureException;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import java.io.ByteArrayOutputStream;
import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.net.Socket;
import java.net.SocketException;
import java.security.InvalidKeyException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.util.Arrays;
import java.util.List;

@Getter
public class Client implements Protocol {
    private Socket clientSocket;
    private String messageReceived;
    private final Logger logger = LoggerFactory.getLogger(Client.class);
    private final Cryptography cryptography;
    private final PrivateKey clientKey;
    private final PublicKey receiverKey;
    private final SignatureManager signatureManager;

    public Client(Socket socket, Cryptography crypto, PrivateKey privateKey, PublicKey publicKey, SignatureManager signManager) throws SocketException {
        clientSocket = socket;
        clientSocket.setSoTimeout(3000);
        cryptography = crypto;
        clientKey = privateKey;
        receiverKey = publicKey;
        signatureManager = signManager;
    }

    public void sendStringMessage(String message) {
        DataOutputStream outputStream;
        DataInputStream inputStream;
        try {
            outputStream = new DataOutputStream(clientSocket.getOutputStream());
            inputStream = new DataInputStream(clientSocket.getInputStream());
            outputStream.write(message.getBytes());
            byte[] array = new byte[1024];
            int bytesRead = inputStream.read(array);
            if(bytesRead > 0){
                messageReceived = new String(Arrays.copyOfRange(array, 0, bytesRead));
            }
        } catch (IOException e) {
            logger.error(e.getMessage());
        }
    }

    private byte[] temperatureDevicesToByteArray(List<TemperatureDevice> temperatureDevices) throws IOException {
        ByteArrayOutputStream byteStream = new ByteArrayOutputStream();
        DataOutputStream dataOutputStream = new DataOutputStream(byteStream);
        dataOutputStream.write("CHANGE_CONFIG".getBytes());
        for(TemperatureDevice device: temperatureDevices) {
            dataOutputStream.write(device.getId());
            dataOutputStream.write(device.getPublicKey().getEncoded());
            dataOutputStream.writeDouble(device.getTemperature());
        }

        return byteStream.toByteArray();
    }

    private void sendMessage(byte[] data) {
        DataOutputStream outputStream;
        DataInputStream inputStream;
        try {
            outputStream = new DataOutputStream(clientSocket.getOutputStream());
            inputStream = new DataInputStream(clientSocket.getInputStream());
            outputStream.write(data);
            byte[] decryptedData = receiveMessage(inputStream);

        } catch (Exception e) {
            logger.error(e.getMessage());
        }
    }

    private int readHeaderWithSize(DataInputStream inputStream, ByteArrayOutputStream byteStream) throws IOException {
        int version = inputStream.readInt();
        int size = inputStream.readInt();
        int id = inputStream.readInt();
        byteStream.write(version);
        byteStream.write(size);
        byteStream.write(id);

        return size;
    }

    private byte[] readData(int dataSize, ByteArrayOutputStream byteStream, DataInputStream inputStream) throws IOException {
        byte[] dataByteArray = new byte[dataSize];
        if(inputStream.read(dataByteArray, 0, dataSize) != dataSize) {
            throw new IncorrectMessageSizeException();
        }
        byteStream.write(dataByteArray);

        return dataByteArray;
    }

    private byte[] receiveMessage(DataInputStream inputStream) throws IOException, BadPaddingException, InvalidKeyException, IllegalBlockSizeException {
        ByteArrayOutputStream byteStream = new ByteArrayOutputStream();
        int dataSize = readHeaderWithSize(inputStream, byteStream) - HEADER_SIZE;
        byte[] data = readData(dataSize, byteStream, inputStream);

        if(!signatureManager.verifySignature(byteStream.toByteArray(), receiverKey, inputStream.readAllBytes())) {
            throw new IncorrectSignatureException();
        }

        return cryptography.decryptData(data, clientKey);
    }

    public void sendToTemperatureRegulatorChangeConfig(List<TemperatureDevice> temperatureDevices) throws IOException, BadPaddingException, InvalidKeyException, IllegalBlockSizeException {
        byte[] encryptedData = cryptography.encryptData(temperatureDevicesToByteArray(temperatureDevices), receiverKey);
        byte[] wholeMessage = messageWithHeader(encryptedData);
        byte[] signature = signatureManager.getSignature(wholeMessage, clientKey);
        ByteArrayOutputStream byteStream = new ByteArrayOutputStream();
        byteStream.write(wholeMessage);
        byteStream.write(signature);

        sendMessage(byteStream.toByteArray());
    }

    public void sendToLightRegulatorChangeConfig(List<LightDevice> lightDevices) {

    }
}
