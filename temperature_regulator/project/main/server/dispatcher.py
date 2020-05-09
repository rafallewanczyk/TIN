import socket
import threading
from server_processer import ServerProcesser
from processer import Processer
from config_handling.config_handler import ConfigHandler
from cryptography_handler import CryptographyHandler
from temperature_device.temperature_device_info_list import TemperatureDeviceInfoList


class ServerDispatcher:
    def __init__(self, config_handler: ConfigHandler, cryptography_handler: CryptographyHandler):
        self._config_handler = config_handler
        Processer.configure(config_handler, cryptography_handler)
        self._create_listener_socket()
        self._device_list = TemperatureDeviceInfoList()
    
    def _create_listener_socket(self):
        try:
            self._listener_socket = socket.socket(family=socket.AF_INET, type=socket.SOCK_STREAM)
        except OSError:
            print("Couldnt create socket!")
            exit(2)
        self._listener_socket.bind((self._config_handler.listener_socket_address, self._config_handler.listener_socket_port))
        self._listener_socket.listen(self._config_handler.listener_socket_max_connections)
        self._listener_socket.settimeout(self._config_handler.listener_socket_timeout)
        print(f"Server created. Interface: {self._config_handler.listener_socket_address} Port: {self._loader.listener_socket_port}")

    def run(self):
        counter = 0  # Used as unique id
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
                    thread = ServerProcesser(counter, connection_socket, client_address, self._device_list)
                    counter += 1
                    thread.run()
        except KeyboardInterrupt:  # SIGINT
            self._listener_socket.close()

