import socket
import threading
from server.server_processer import ServerProcesser
from server.processer import Processer
from config_handling.config_handler import ConfigHandler
from cryptography_handler import CryptographyHandler
from temperature_device.temperature_device_info_list import TemperatureDeviceInfoList


class ServerDispatcher:
    def __init__(self, config_handler: ConfigHandler):
        Processer.configure(config_handler)
        self._create_listener_socket(config_handler)
        self._device_list = TemperatureDeviceInfoList()
    
    def _create_listener_socket(self, config_handler: ConfigHandler):
        try:
            self._listener_socket = socket.socket(family=socket.AF_INET, type=socket.SOCK_STREAM)
        except OSError:
            print("Couldnt create socket!")
            exit(2)
        self._listener_socket.bind((config_handler.listener_socket_address, config_handler.listener_socket_port))
        self._listener_socket.listen(config_handler.listener_socket_max_connections)
        self._listener_socket.settimeout(config_handler.listener_socket_timeout)
        print(f"Server created. Interface: {config_handler.listener_socket_address} Port: {config_handler.listener_socket_port}")

    def run(self):
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
                    thread = ServerProcesser(connection_socket, client_address, self._device_list)
                    thread.run()
        except KeyboardInterrupt:  # SIGINT
            self._listener_socket.close()

