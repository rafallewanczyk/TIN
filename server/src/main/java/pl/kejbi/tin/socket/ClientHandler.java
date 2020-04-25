package pl.kejbi.tin.socket;

import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.net.Socket;
import java.util.Arrays;

public class ClientHandler implements Runnable{
    private final Socket clientSocket;

    public ClientHandler(Socket socket) {
        clientSocket = socket;
    }

    @Override
    public void run() {
        DataInputStream inputStream;
        DataOutputStream outputStream;
        try {
            outputStream = new DataOutputStream(clientSocket.getOutputStream());
            inputStream = new DataInputStream(clientSocket.getInputStream());
            byte[] dataReceived = new byte[1024];
            int readBytes = inputStream.read(dataReceived);
            //there will be implemented data processing
            outputStream.write(("Got message " + new String(Arrays.copyOfRange(dataReceived,0,readBytes))).getBytes());
            clientSocket.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
