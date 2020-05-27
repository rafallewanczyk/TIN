package pl.kejbi.tin.socket.builder;

import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.Socket;

@Getter
public class SocketBuilder {
    private int port;
    private int socketTimeout;
    private String hostname;

    public SocketBuilder createSocket() {
        port = 45999;
        hostname = "127.0.0.1";
        socketTimeout = 10000;
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

    public SocketBuilder withTimeout(int timeout) {
        socketTimeout = timeout;

        return this;
    }

    public Socket build() throws IOException {
        Socket socket = new Socket(hostname, port);
        socket.setSoTimeout(socketTimeout);

        return socket;
    }
}
