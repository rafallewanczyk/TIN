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

    def "should create server socket with correct local port"() {
        given:
        ServerSocketBuilder serverSocketBuilder = new ServerSocketBuilder()
        serverSocketBuilder.logger = Mock(Logger)

        when:
        serverSocket = serverSocketBuilder.createServerSocket().withPort(50000).build()

        then:
        0 * serverSocketBuilder.logger.error(!null)
        serverSocket.getLocalPort() == 50000
    }

    def "should create socket with correct local port and host"() {
        given:
        SocketBuilder socketBuilder = new SocketBuilder()
        socketBuilder.logger = Mock(Logger)
        serverSocket = new ServerSocketBuilder().createServerSocket().withPort(50000).build()
        Server server = new Server(serverSocket)
        server.start()

        when:
        Socket socket = socketBuilder.createSocket().withPort(50000).withHostname("127.0.0.1").build()
        server.stopServer()

        then:
        0 * socketBuilder.logger.error(!null)
        socket.getPort() == 50000
        socket.getInetAddress() == InetAddress.getByName("127.0.0.1")
    }

    def "should error connection fail when no server"() {
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
        server.stopServer()

        then:
        client.getMessageReceived() == "Got message test"
    }

    def "should error port bind error when port is out of range"() {
        given:
        ServerSocketBuilder serverSocketBuilder = new ServerSocketBuilder()
        serverSocketBuilder.logger = Mock(Logger)

        when:
        serverSocket = serverSocketBuilder.createServerSocket().withPort(70000).build()

        then:
        1 * serverSocketBuilder.logger.error("Port value out of range: 70000")
    }

    def "should error read timeout when server is not running"() {
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

    def "should stop the server"() {
        given:
        serverSocket = createServerSocket()
        Server server = new Server(serverSocket)
        server.logger = Mock(Logger)
        server.start()

        when:
        server.stopServer()
        Thread.sleep(3000) //waiting for timeout in server

        then:
        serverSocket.isClosed()
        1 * server.logger.info("Server stopped")
    }

}
