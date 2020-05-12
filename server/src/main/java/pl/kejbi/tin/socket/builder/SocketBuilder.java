package pl.kejbi.tin.socket.builder;

import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.Socket;

@Getter
public class SocketBuilder {
    private int port;
    private String hostname;
    private Logger logger = LoggerFactory.getLogger(ServerSocketBuilder.class);

    public SocketBuilder createSocket() {
        port = 45999;
        hostname = "127.0.0.1";

        return this;
    }

    public SocketBuilder withPort(int portNumber) {
        port = portNumber;

        return this;
    }

    public SocketBuilder withHostname(String host) {
        hostname = host;

        return this;
    }

    public Socket build() {
        try {
            return new Socket(hostname, port);
        } catch (IOException e) {
            logger.error(e.getMessage());
        }

        return null;
    }
}
