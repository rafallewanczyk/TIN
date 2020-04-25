import socket
from server_thread import ServerThread

class ServerDispatcher:
    LISTENER_SOCKET_ADDRESS = '127.0.0.1'
    LISTENER_SOCKET_TIMEOUT = 1
    MAX_CONNECTIONS = 10

    def __init__(self, port: int):
        self._listener_port = port
        self._listener_socket = socket.socket(family=socket.AF_INET, type=socket.SOCK_STREAM)
        self._listener_socket.bind((ServerDispatcher.LISTENER_SOCKET_ADDRESS, self._listener_port))
        self._listener_socket.listen(ServerDispatcher.MAX_CONNECTIONS)
        self._listener_socket.settimeout(ServerDispatcher.LISTENER_SOCKET_TIMEOUT)
        print(f"Server created. Interface: {self.LISTENER_SOCKET_ADDRESS} Port: {self._listener_port}")
    
    def run(self):
        counter = 0
        try:
            while(True):
                try:
                    connection_socket, client_address = self._listener_socket.accept()
                except socket.timeout:
                    connection_socket = None
                if connection_socket:
                    thread = ServerThread(counter, connection_socket, client_address)
                    thread.run()
        except KeyboardInterrupt:  # SIGINT
            self._listener_socket.close()
            return
        return

