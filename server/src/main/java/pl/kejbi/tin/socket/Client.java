package pl.kejbi.tin.socket;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class Client implements Protocol {
    private final Socket clientSocket;


    public DataWithSignature sendDataAndReceiveResponse(byte[] data) throws IOException {
        DataOutputStream outputStream = new DataOutputStream(clientSocket.getOutputStream());
        DataInputStream inputStream = new DataInputStream(clientSocket.getInputStream());
        outputStream.write(data);
        DataWithSignature dataWithSignature = receiveMessage(inputStream);
        clientSocket.close();

        return dataWithSignature;
//        try {
//            outputStream = new DataOutputStream(clientSocket.getOutputStream());
//            inputStream = new DataInputStream(clientSocket.getInputStream());
//            outputStream.write(data);
//            byte[] decryptedData = receiveMessage(inputStream);
//            responseHandler.handleResponse(decryptedData);
//            clientSocket.close();
//        } catch (Exception e) {
//            logger.error(e.getMessage());
//        }
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

    private DataWithSignature receiveMessage(DataInputStream inputStream) throws IOException {
        ByteBuffer byteBuffer = readHeader(inputStream);
        byte[] data = readData(byteBuffer.capacity() - HEADER_SIZE - SIGN_SIZE, byteBuffer, inputStream);
        byte[] signature = inputStream.readNBytes(SIGN_SIZE);

        return new DataWithSignature(data, signature);
    }
}
