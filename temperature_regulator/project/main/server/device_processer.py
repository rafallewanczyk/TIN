from threading import Thread, Lock
import socket
from typing import Tuple
from config_handling.config_handler import ConfigHandler
from processing.byte_processing import process_header, get_data, get_signature
from cryptography_handler import CryptographyHandler


class DeviceProcesser(Thread):

    configured = False

    _print_lock = Lock()

    def configure(loader: ConfigHandler, cryptography_handler: CryptographyHandler):
        DeviceProcesser.RECV_MSG_MAX_SIZE = loader.recv_msg_max_size
        DeviceProcesser.TEXT_ENCODING = loader.text_encoding
        DeviceProcesser.CLIENT_TIMEOUT = loader.client_timeout
        DeviceProcesser.TSHP_PROTOCOL_VERSION = loader.tshp_protocol_version
        DeviceProcesser._cryptography_handler = cryptography_handler
        DeviceProcesser.configured = True

    def __init__(self, id: int, connection_socket: socket.socket, server_address_pair: Tuple[str, str]):
        if(not self.configured):
            raise RuntimeError("Server thread not configured!")
        Thread.__init__(self)
        if not connection_socket:
            raise RuntimeError("No socket specified")
        self._connection_socket = connection_socket
        self._connection_socket.settimeout(Processer.CLIENT_TIMEOUT)
        self._client_address, self._client_port = client_address_pair
        self._client_port = int(self._client_port)  # Change str to int
        self._id = id

    def run(self):
        Processer._threaded_print(f"Thread {self._id} started running. Device address: {self._client_address} Device port: {self._client_port}")
        try:
            data = self._get_data_from_client()
        except socket.timeout:
            Processer._threaded_print(f"No data to read for a long time!")
        else:
            self._process_received_data(data)
        self._print_closing_message()

    def _get_data_from_client(self) -> bytearray:
        """ Data receiving protocol """
        data = bytearray()
        while True:
            portion = self._connection_socket.recv(Processer.RECV_MSG_MAX_SIZE)
            if not portion:
                break
            data.extend(portion)
        return data

    def _process_received_data(self, data: bytearray):
        protocol_version, amount_of_bytes, sender_id = process_header(data)
        if protocol_version != Processer.TSHP_PROTOCOL_VERSION:
            pass  # TODO: send info that protocol version doesnt match
        relevant_information = get_data(data)
        signature = get_signature(data)
        if not self._cryptography_handler.check_signature(signature, relevant_information, sender_id):
            pass # TODO: send info that signature doesnt match
        self._process_relevant_information(relevant_information)

    def _process_relevant_information(data: bytearray):
        

    def _threaded_print(text: str):
        Processer._print_lock.acquire()
        print(text)
        Processer._print_lock.release()

    def _print_closing_message(self):
        Processer._threaded_print(f"Thread {self._id} stopped running. Client address: {self._client_address} Client port: {self._client_port}")