import socket, threading
from server_thread import ServerThread
from config_loader.config_loader import ConfigLoader


class ServerDispatcher:
    def __init__(self, loader: ConfigLoader):
        self._loader = loader
        ServerThread.configure(loader)
        try:
            self._listener_socket = socket.socket(family=socket.AF_INET, type=socket.SOCK_STREAM)
        except OSError:
            print("Couldnt create socket!")
            exit(2)
        self._listener_socket.bind((loader.listener_socket_address, loader.listener_socket_port))
        self._listener_socket.listen(loader.listener_socket_max_connections)
        self._listener_socket.settimeout(loader.listener_socket_timeout)
        print(f"Server created. Interface: {loader.listener_socket_address} Port: {loader.listener_socket_port}")
    
    def run(self):
        counter = 0
        try:
            while(True):
                try:
                    connection_socket, client_address = self._listener_socket.accept()
                except socket.timeout:
                    pass
                except OSError:
                    print("Couldnt create ephemeral socket for connection")  
                    if(threading.active_count() <= 1):
                        self._listener_socket.close()
                        return
                else:
                    thread = ServerThread(counter, connection_socket, client_address)
                    counter += 1
                    thread.run()
        except KeyboardInterrupt:  # SIGINT
            self._listener_socket.close()

