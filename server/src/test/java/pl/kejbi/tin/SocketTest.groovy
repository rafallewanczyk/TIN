package pl.kejbi.tin

import org.slf4j.Logger
import pl.kejbi.tin.socket.Client
import pl.kejbi.tin.socket.Server
import pl.kejbi.tin.socket.builder.ServerSocketBuilder
import pl.kejbi.tin.socket.builder.SocketBuilder
import spock.lang.Specification

class SocketTest extends Specification {

    Socket socket;
    ServerSocket serverSocket;

    def createServerSocket() {
        return new ServerSocketBuilder().createServerSocket().build()
    }

    def createClientSocket() {
        return new SocketBuilder().createSocket().build()
    }

    def cleanup() {
        if(socket != null) {
            if(!socket.isClosed()) {
                socket.close()
            }
            socket = null
        }
        if(serverSocket != null) {
            if(!serverSocket.isClosed()) {
                serverSocket.close()
            }
            serverSocket = null
        }
    }

    def "should create server socket"() {
        given:
        ServerSocketBuilder serverSocketBuilder = new ServerSocketBuilder()
        serverSocketBuilder.logger = Mock(Logger)

        when:
        serverSocket = serverSocketBuilder.createServerSocket().withPort(50000).build()

        then:
        0 * serverSocketBuilder.logger.error(!null)
        serverSocket.getLocalPort() == 50000
    }

    def "should create socket"() {
        given:
        SocketBuilder socketBuilder = new SocketBuilder()
        socketBuilder.logger = Mock(Logger)
        serverSocket = new ServerSocketBuilder().createServerSocket().withPort(50000).build()
        Server server = new Server(serverSocket)
        server.start()

        when:
        Socket socket = socketBuilder.createSocket().withPort(50000).withHostname("127.0.0.1").build()
        server.setStop(true)

        then:
        0 * socketBuilder.logger.error(!null)
        socket.getPort() == 50000
    }

    def "should error connection fail"() {
        given:
        SocketBuilder socketBuilder = new SocketBuilder()
        socketBuilder.logger = Mock(Logger)

        when:
        socket = socketBuilder.createSocket().withPort(50000).withHostname("127.0.0.1").build()

        then:
        1 * socketBuilder.logger.error("Connection refused: connect")
    }

    def "should send and receive message"() {
        given:
        serverSocket = createServerSocket()
        Server server = new Server(serverSocket)
        server.start()
        socket = createClientSocket()
        Client client = new Client(socket)

        when:
        client.sendStringMessage("test")
        server.setStop(true);

        then:
        client.getMessageReceived() == "Got message test"
    }

    def "should error port bind error"() {
        given:
        ServerSocketBuilder serverSocketBuilder = new ServerSocketBuilder()
        serverSocketBuilder.logger = Mock(Logger)

        when:
        serverSocket = serverSocketBuilder.createServerSocket().withPort(70000).build()

        then:
        1 * serverSocketBuilder.logger.error("Port value out of range: 70000")
    }

    def "should error read timeout"() {
        given:
        serverSocket = createServerSocket()
        Server server = new Server(serverSocket)
        socket = createClientSocket()
        Client client = new Client(socket)
        client.logger = Mock(Logger)

        when:
        client.sendStringMessage("test")

        then:
        1 * client.logger.error("Read timed out")
    }

}
