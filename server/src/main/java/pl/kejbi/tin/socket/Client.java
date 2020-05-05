package pl.kejbi.tin.socket;

import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.net.Socket;
import java.net.SocketException;
import java.util.Arrays;

@Getter
public class Client {
    private Socket clientSocket;
    private String messageReceived;
    private Logger logger = LoggerFactory.getLogger(Client.class);

    public Client(Socket socket) throws SocketException {
        clientSocket = socket;
        clientSocket.setSoTimeout(3000);
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
}
