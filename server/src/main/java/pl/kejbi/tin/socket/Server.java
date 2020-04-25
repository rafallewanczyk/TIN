package pl.kejbi.tin.socket;

import lombok.Getter;
import lombok.Setter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.SocketException;
import java.net.SocketTimeoutException;

@Getter
@Setter
public class Server extends Thread {
    private ServerSocket serverSocket;
    private volatile boolean stop;
    private Logger logger = LoggerFactory.getLogger(Server.class);

    public Server(ServerSocket socket) throws SocketException {
        serverSocket = socket;
    }

    @Override
    public void run() {
        while(!stop) {
            try {
                Socket clientSocket = serverSocket.accept();
                ClientHandler clientHandler = new ClientHandler(clientSocket);

                new Thread(clientHandler).start();
            } catch (IOException e) {
                logger.error(e.getMessage());
            }
        }
        try {
            serverSocket.close();
        } catch (IOException e) {
            logger.error(e.getMessage());
        }
    }
}
