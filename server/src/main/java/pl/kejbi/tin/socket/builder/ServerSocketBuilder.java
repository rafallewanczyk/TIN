package pl.kejbi.tin.socket.builder;

import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.ServerSocket;

@Getter
public class ServerSocketBuilder {
    private int port;
    private Logger logger = LoggerFactory.getLogger(ServerSocketBuilder.class);

    public ServerSocketBuilder createServerSocket() {
        port = 45999;
        return this;
    }

    public ServerSocketBuilder withPort(int portNumber) {
        port = portNumber;
        return this;
    }


    public ServerSocket build() {
        try {
            return new ServerSocket(port);
        } catch (IOException | IllegalArgumentException e) {
            logger.error(e.getMessage());
        }

        return null;
    }

}
