package pl.kejbi.tin.socket;

import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pl.kejbi.tin.security.Cryptography;
import pl.kejbi.tin.security.SignatureManager;
import pl.kejbi.tin.socket.exceptions.IncorrectMessageSizeException;
import pl.kejbi.tin.socket.exceptions.IncorrectSignatureException;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import java.io.*;
import java.net.Socket;
import java.net.SocketException;
import java.nio.ByteBuffer;
import java.security.InvalidKeyException;
import java.security.PrivateKey;
import java.security.PublicKey;

@Getter
public class Client implements Protocol {
    private final Socket clientSocket;
    private final Logger logger = LoggerFactory.getLogger(Client.class);
    private final Cryptography cryptography;
//    private final PrivateKey clientKey;
//    private final PublicKey receiverKey;
//    private final SignatureManager signatureManager;
    private final ResponseHandler responseHandler;

    public Client(Socket socket, Cryptography crypto, PrivateKey privateKey, PublicKey publicKey, SignatureManager signManager, ResponseHandler handler) throws SocketException {
        clientSocket = socket;
        clientSocket.setSoTimeout(5000);
        cryptography = crypto;
//        clientKey = privateKey;
//        receiverKey = publicKey;
//        signatureManager = signManager;
        responseHandler = handler;
    }

    public Client(Socket socket, Cryptography crypto, ResponseHandler handler) throws SocketException {
        clientSocket = socket;
        clientSocket.setSoTimeout(5000);
        cryptography = crypto;
        responseHandler = handler;
    }

    public void sendMessage(byte[] data) {
        DataOutputStream outputStream;
        DataInputStream inputStream;
        try {
            outputStream = new DataOutputStream(clientSocket.getOutputStream());
            inputStream = new DataInputStream(clientSocket.getInputStream());
            outputStream.write(data);
            byte[] decryptedData = receiveMessage(inputStream);
            responseHandler.handleResponse(decryptedData);
            clientSocket.close();
        } catch (Exception e) {
            logger.error(e.getMessage());
        }
    }

    private ByteBuffer readHeader(DataInputStream inputStream) throws IOException {
        int version = inputStream.readInt();
        int size = inputStream.readInt();
        int id = inputStream.readInt();
        ByteBuffer byteBuffer = ByteBuffer.allocate(size);
        byteBuffer.putInt(version);
        byteBuffer.putInt(size);
        byteBuffer.putInt(id);

        return byteBuffer;
    }

    private byte[] readData(int dataSize, ByteBuffer byteBuffer, DataInputStream inputStream) throws IOException {
        byte[] dataByteArray = new byte[dataSize];
        if(inputStream.read(dataByteArray, 0, dataSize) != dataSize) {
            throw new IncorrectMessageSizeException();
        }
        byteBuffer.put(dataByteArray);

        return dataByteArray;
    }

    private byte[] receiveMessage(DataInputStream inputStream) throws IOException, BadPaddingException, InvalidKeyException, IllegalBlockSizeException {
        ByteBuffer byteBuffer = readHeader(inputStream);
        byte[] data = readData(byteBuffer.capacity() - HEADER_SIZE, byteBuffer, inputStream);

//        if(!signatureManager.verifySignature(byteBuffer.array(), receiverKey, inputStream.readAllBytes())) {
//            throw new IncorrectSignatureException();
//        }

//        return cryptography.decryptData(data, clientKey);
        return data;
    }
}
