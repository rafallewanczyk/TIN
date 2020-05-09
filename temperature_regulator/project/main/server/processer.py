from threading import Thread, Lock
import socket
from typing import Tuple
from config_handling.config_handler import ConfigHandler
from processing.byte_processing import process_header, get_data, get_signature
from cryptography_handler import CryptographyHandler
from abc import ABC, abstractclassmethod


class Processer(Thread, ABC):

    configured = False

    _print_lock = Lock()

    @abstractclassmethod
    def run(self):
        pass

    def configure(loader: ConfigHandler, cryptography_handler: CryptographyHandler):
        Processer.RECV_MSG_MAX_SIZE = loader.recv_msg_max_size
        Processer.TEXT_ENCODING = loader.text_encoding
        Processer.CLIENT_TIMEOUT = loader.receiving_timeout
        Processer.TSHP_PROTOCOL_VERSION = loader.tshp_protocol_version
        Processer.BYTE_ORDER = loader.byte_order
        Processer.__cryptography_handler = cryptography_handler
        Processer.configured = True

    def __init__(self, id: int, connection_socket: socket.socket, address_pair: Tuple[str, str]):
        if(not self.configured):
            raise RuntimeError("Processer not configured!")
        Thread.__init__(self)
        if not connection_socket:
            raise RuntimeError("No socket specified")
        self._connection_socket = connection_socket
        self._connection_socket.settimeout(Processer.CLIENT_TIMEOUT)
        self._address, self._port = address_pair
        self._port = int(self._port)  # Change str to int
        self._id = id

    def __receive_from_host(self) -> bytearray:
        data = bytearray()
        while True:
            portion = self._connection_socket.recv(Processer.RECV_MSG_MAX_SIZE)
            if not portion:
                break
            data.extend(portion)
        return data
    
    def __send_to_host(self, data: bytearray) -> bool:
        try:
            self._connection_socket.sendall(data.encode(encoding=self.TEXT_ENCODING)) 
        except OSError:
            return False  # Didnt send data
        else:
            return True  # Everything's fine

    def _send_data(self, relevant_data: bytearray) -> bool:
        data = self.__encapsulate_data(relevant_data)
        return self.__send_to_host(data)

    def _receive_data(self) -> bytearray:
        try:
            data = self.__receive_from_host()
        except socket.timeout:
            return None  # Sender stopped responding
        return self.__get_relevant_information(data)

    def __encapsulate_data(self, data: bytearray) -> bytearray:
        header = self.__create_header()
        signature = self.__cryptography_handler.create_signature(data)
        data = self.__cryptography_handler.encrypt_data(data)
        header.extend(data)
        header.extend(signature)
        return header

    def __get_relevant_information(self, data: bytearray) -> bytearray:
        """ Returns None if shouldnt process the data"""
        protocol_version, amount_of_bytes, sender_id = self.__process_header(data)
        if protocol_version != Processer.TSHP_PROTOCOL_VERSION:
            pass  # TODO: send info that protocol version doesnt match
        relevant_information = self.__get_data(data)
        relevant_information = self.__cryptography_handler.decrypt_data(relevant_information)
        signature = self.__get_signature(data)
        if not self._cryptography_handler.check_signature(signature, relevant_information, sender_id):
            pass  # TODO: send info that signature doesnt match
        return relevant_information

    def __create_header(self, protocol_version: int, amount_of_bytes: int, id: int) -> bytearray:
        header = bytearray()
        header.extend(protocol_version.to_bytes(length=4, byteorder=self.BYTE_ORDER))
        header.extend(amount_of_bytes.to_bytes(length=4, byteorder=self.BYTE_ORDER))
        header.extend(id.to_bytes(length=4, byteorder=self.BYTE_ORDER))
        return header

    def __process_header(self, data: bytearray) -> Tuple[int, int, int]:
        protocol_version = self.__get_protocol_version(data)
        amount_of_bytes = self.__get_amount_of_bytes_sent(data)
        sender_id = self.__get_sender_id(data)
        return protocol_version, amount_of_bytes, sender_id

    def __get_protocol_version(self, data: bytearray) -> int:
        return self.__transform_bytes_to_int(data[:4])

    def __get_amount_of_bytes_sent(self, data: bytearray) -> int:
        return self.__transform_bytes_to_int(data[4:8])

    def __get_sender_id(self, data: bytearray) -> int:
        return self.__transform_bytes_to_int(data[8:12])

    def __get_data(self, data: bytearray) -> bytearray:
        return data[12:-128]

    def __get_signature(self, data: bytearray) -> bytearray:
        return data[-128:]
        
    def __transform_bytes_to_int(self, data: bytearray) -> int:
        return int.from_bytes(data, 'little')

    def _threaded_print(text: str):
        Processer._print_lock.acquire()
        print(text)
        Processer._print_lock.release()

    def _print_closing_message(self):
        Processer._threaded_print(f"Thread {self._id} stopped running. Client address: {self._client_address} Client port: {self._client_port}")