from threading import Thread, Lock
import socket
from typing import Tuple
from config_handling.config_handler import ConfigHandler
from abc import ABC, abstractclassmethod
from struct import pack, unpack


class Processer(ABC):

    configured = False

    _print_lock = Lock()

    def configure(loader: ConfigHandler):
        Processer.RECV_MSG_MAX_SIZE = loader.recv_msg_max_size
        Processer.TEXT_ENCODING = loader.text_encoding
        Processer.SEND_AND_RECEIVE_TIMEOUT = loader.client_timeout
        Processer.TSHP_PROTOCOL_VERSION = loader.tshp_protocol_version
        Processer.BYTE_ORDER = loader.byte_order
        Processer.ID = loader.id
        if loader.secure == True:
            Processer.__cryptography_handler = cryptography_handler
        else
            Processer.__cryptography_handler = None
        Processer.configured = True

    def __init__(self, connection_socket: socket.socket, address_pair: Tuple[str, str]):
        if (not self.configured):
            raise RuntimeError("Processer not configured!")
        Thread.__init__(self)
        if not connection_socket:
            raise RuntimeError("No socket specified!")
        self._connection_socket = connection_socket
        self._connection_socket.settimeout(Processer.SEND_AND_RECEIVE_TIMEOUT)
        self._address, self._port = address_pair
        self._port = int(self._port)  # Change str to int

    def __receive_from_host(self) -> bytearray:
        data = bytearray()
        portion = self._connection_socket.recv(Processer.RECV_MSG_MAX_SIZE)
        if not portion:
            return data
        protocol_version, amount_of_bytes, sender_id = self.__process_header(portion)
        while True:
            if amount_of_bytes - Processer.RECV_MSG_MAX_SIZE > 0:
                data.extend(portion)
                portion = self._connection_socket.recv(Processer.RECV_MSG_MAX_SIZE)
                amount_of_bytes -= Processer.RECV_MSG_MAX_SIZE
            else:
                data.extend(portion[:amount_of_bytes])
                break
        return data

    def _send_data(self, relevant_data: bytearray) -> bool:
        data = self.__encapsulate_data(relevant_data)
        try:
            self._connection_socket.sendall(data)
        except socket.timeout:
            self._threaded_print(f"Couldnt send data, timed out. Address: {self._address} Port: {self._port}")
            return False
        except OSError:
            self._threaded_print(f"Couldnt send data. Address: {self._address} Port: {self._port}")
            return False
        else:  # Everything's fine
            return True

    def _receive_data(self) -> bytearray:
        try:
            data = self.__receive_from_host()
        except socket.timeout:
            self._threaded_print(f"Timed out. Address: {self._address} Port: {self._port}")
            return None
        if len(data) == 0:
            return bytearray()
        return self.__get_relevant_information(data)

    def __encapsulate_data(self, data: bytearray) -> bytearray:
        if self.__cryptography_handler:
            signature = self.__cryptography_handler.create_signature(data)
            encrypted_data = self.__cryptography_handler.encrypt_data(data)
            bytes_to_send = bytearray(self.__create_header(self.TSHP_PROTOCOL_VERSION, 12 + len(encrypted_data) + len(signature) , self.ID))
            bytes_to_send.extend(encrypted_data)
            bytes_to_send.extend(signature)
        else:
            bytes_to_send = bytearray(self.__create_header(self.TSHP_PROTOCOL_VERSION, 12 + len(data) , self.ID))
            bytes_to_send.extend(data)
        return bytes_to_send

    def __get_relevant_information(self, data: bytearray) -> bytearray:
        protocol_version, amount_of_bytes, sender_id = self.__process_header(data)
        if protocol_version != Processer.TSHP_PROTOCOL_VERSION:
            self._threaded_print(f"Warning : Protocol version doesnt match. Address: {self._address} Port: {self._port}")
        relevant_information = self.__get_data(data)
        if self.__cryptography_handler:
            relevant_information = self.__cryptography_handler.decrypt_data(relevant_information)
            signature = self.__get_signature(data)
            if not self._cryptography_handler.check_signature(signature, relevant_information, sender_id):
                self._threaded_print(f"Signature error. Address: {self._address} Port: {self._port}")
                return None
        return relevant_information

    def __create_header(self, protocol_version: int, amount_of_bytes: int, id: int) -> bytearray:
        header = pack("!iii", protocol_version, amount_of_bytes, id)
        return header

    def __process_header(self, data: bytearray) -> Tuple[int, int, int]:
        protocol_version = self.__get_protocol_version(data)
        amount_of_bytes = self.__get_amount_of_bytes_sent(data)
        sender_id = self.__get_sender_id(data)
        return protocol_version, amount_of_bytes, sender_id

    def __get_protocol_version(self, data: bytearray) -> int:
        return unpack("!i", data[:4])[0]

    def __get_amount_of_bytes_sent(self, data: bytearray) -> int:
        return unpack("!i", data[4:8])[0]

    def __get_sender_id(self, data: bytearray) -> int:
        return unpack("!i", data[8:12])[0]

    def __get_data(self, data: bytearray) -> bytearray:
        if self.__cryptography_handler:
            return data[12:-128]
        return data[12:]

    def __get_signature(self, data: bytearray) -> bytearray:
        return data[-128:]

    def _threaded_print(self, text: str):
        Processer._print_lock.acquire()
        print(text)
        Processer._print_lock.release()
