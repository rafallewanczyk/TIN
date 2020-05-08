from threading import Thread, Lock
import socket
from typing import Tuple
from config_loader.config_loader import ConfigLoader


class ServerThread(Thread):

    configured = False

    _print_lock = Lock()

    def configure(loader: ConfigLoader):
        ServerThread.RECV_MSG_MAX_SIZE = loader.recv_msg_max_size
        ServerThread.TEXT_ENCODING = loader.text_encoding
        ServerThread.CLIENT_TIMEOUT = loader.client_timeout
        ServerThread.configured = True

    def __init__(self, id: int, connection_socket: socket.socket, client_address_pair: Tuple[str, str]):
        if(not self.configured):
            raise RuntimeError("Server thread not configured!")
        Thread.__init__(self)
        if not connection_socket:
            raise RuntimeError("No socket specified")
        self._connection_socket = connection_socket
        self._connection_socket.settimeout(ServerThread.CLIENT_TIMEOUT)
        self._client_address, self._client_port = client_address_pair
        self._client_port = int(self._client_port)  # Change str to int
        self._id = id

    def run(self):
        ServerThread._threaded_print(f"Thread {self._id} started running. Client address: {self._client_address} Client port: {self._client_port}")
        try:
            data = self._get_data_from_client()
        except socket.timeout:
            ServerThread._threaded_print(f"No data to read for a long time!")
        else:
            self._process_data(data)
        self._print_closing_message()

    def _get_data_from_client(self) -> bytearray:
        """ Data receiving protocol """
        data = bytearray()
        while True:
            portion = self._connection_socket.recv(ServerThread.RECV_MSG_MAX_SIZE)
            if not portion:
                break
            data.extend(portion)
        return data

    def _process_data(self, data: bytearray):
        ServerThread._threaded_print("Message: " + data.decode(encoding=ServerThread.TEXT_ENCODING))

    def _threaded_print(text: str):
        ServerThread._print_lock.acquire()
        print(text)
        ServerThread._print_lock.release()

    def _print_closing_message(self):
        ServerThread._threaded_print(f"Thread {self._id} stopped running. Client address: {self._client_address} Client port: {self._client_port}")