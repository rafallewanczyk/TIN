from abc import ABC
from typing import Dict


class ConfigHandler(ABC):

    def __init__(self, data: Dict[str, str]):
        self._data = data

    @property
    def listener_socket_address(self):
        return self._data['listener socket address']
    
    @property
    def listener_socket_port(self):
        return int(self._data['listener socket port'])
    
    @property
    def listener_socket_timeout(self):
        return int(self._data['listener socket timeout'])
    
    @property
    def listener_socket_max_connections(self):
        return int(self._data['max connections'])
    
    @property
    def recv_msg_max_size(self):
        return int(self._data['recv msg max size'])

    @property
    def text_encoding(self):
        return self._data['text encoding']

    @property
    def client_timeout(self):
        return int(self._data['client timeout'])

    @property
    def tshp_protocol_version(self):
        return int(self._data['TSHP protocol version'])

    @property
    def id(self):
        return int(self._data['regulator id'])

    @property
    def secure(self):
        if self._data['secure'] == 'true':
            return True
        print("Warning : Security not enabled.")
        return False
    
    @property
    def private_key_path(self):
        return self._data['private key path']

    @property
    def public_key_path(self):
        return self._data['public key path']

