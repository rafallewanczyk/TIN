package pl.kejbi.tin.socket.client;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pl.kejbi.tin.socket.exceptions.IncorrectMessageSizeException;
import pl.kejbi.tin.socket.exceptions.NoRegulatorConnectionException;

import java.io.*;
import java.net.Socket;
import java.nio.ByteBuffer;

@Getter
@RequiredArgsConstructor
public class Client implements Protocol {
    private final Socket clientSocket;
    private final Logger logger = LoggerFactory.getLogger(Client.class);

    public DataWithSignature sendDataAndReceiveResponse(byte[] data) throws IOException {
        try {
            DataOutputStream outputStream = new DataOutputStream(clientSocket.getOutputStream());
            DataInputStream inputStream = new DataInputStream(clientSocket.getInputStream());
            outputStream.write(data);
            DataWithSignature dataWithSignature = receiveMessage(inputStream);
            clientSocket.close();

            return dataWithSignature;
        }
        catch (IOException e) {
            clientSocket.close();
            throw new NoRegulatorConnectionException();
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

    private DataWithSignature receiveMessage(DataInputStream inputStream) throws IOException {
        ByteBuffer byteBuffer = readHeader(inputStream);
        byte[] data = readData(byteBuffer.capacity() - HEADER_SIZE - SIGN_SIZE, byteBuffer, inputStream);
        byte[] signature = inputStream.readNBytes(SIGN_SIZE);

        return new DataWithSignature(data, signature);
    }
}
