from server.processer import Processer
import socket
from typing import Tuple, List
from enum import Enum
from struct import pack, unpack
from queue import Queue


class DeviceProcesser(Processer):
    class SenderMessageType(Enum):
        CHANGE_TEMP = "CHANGE_TEMP"
        GET_TEMP = "GET_TEMP"

    class ReceiverMessageType(Enum):
        CURR_TEMP = "CURR_TEMP"

    def __init__(self, id: int, device_connection_socket: socket.socket, device_address_pair: Tuple[str, str], queue: Queue):
        super().__init__(device_connection_socket, device_address_pair)
        self._id = id
        self._queue = queue

    def run(self, sender_message_type: SenderMessageType, data_to_send: Tuple):
        self._threaded_print(f"Device thread started running. Device address: {self._address} Device port: {self._port}")
        try:
            self._send_request(sender_message_type, data_to_send)
        except socket.timeout:
            self._threaded_print(f"Couldnt send data to device. Device address: {self._address} Device port: {self._port}")
            queue.put((id, None))
            return
        except OSError:
            self._threaded_print(f"Couldnt send data to device. Device address: {self._address} Device port: {self._port}")
            queue.put((id, None))
            return
        data = self._receive_data()
        if len(data) == 0:
            queue.put((id, 0))
            self._print_closing_message()
            return
        if data is None:  # Timed out
            self._threaded_print(f"Device didnt send any data. Device address: {self._address} Device port: {self._port}")
            queue.put((id, None))
            return
        message_type, data = self._get_message_type_and_stripped_data(data)
        if message_type is None:
            self._threaded_print(f"Message type unrecognizable. Device address: {self._address} Device port: {self._port}")
            queue.put((id, None))
            return
        else:
            self._process_data(message_type, data)
        self._print_closing_message()

    def _send_request(self, sender_message_type: SenderMessageType, data_to_send: Tuple):
        if(sender_message_type == self.SenderMessageType.GET_TEMP):
            self._request_temperature_from_device()
        elif(sender_message_type == self.SenderMessageType.CHANGE_TEMP):
            temperature, = data_to_send
            self._request_change_device_temperature(temperature)

    def _request_change_device_temperature(self, temperature: float):
        data = bytearray(self.SenderMessageType.CHANGE_TEMP)
        temperature = pack("!d", temperature)
        data.extend(bytearray(temperature))
        self._send_data(data)

    def _request_temperature_from_device(self):
        data_to_send = bytearray(self.SenderMessageType.GET_TEMP.value)
        self._send_data(data_to_send)

    def _get_message_type_and_stripped_data(self, data: bytearray) -> Tuple[SenderMessageType, bytearray]:
        message_type = None
        if message_type is None:
            message_type = self._check_message_type(self.MessageType.CURR_TEMP, data)
            if message_type is None:
                return None, None
        return message_type, data[len(message_type):]
        

    def _check_message_type(self, potential_message_type: SenderMessageType, data: bytearray) -> SenderMessageType:
        message_type = data[:len(potential_message_type)]
        if message_type.decode(self.TEXT_ENCODING) == potential_message_type:
            return potential_message_type
        return None

    def _process_data(self, message_type: SenderMessageType, data: bytearray):
        if message_type == self.MessageType.CURR_TEMP:
            self._process_current_temperature_from_device(data)
        else:
            pass  # There should be more message types

    def _process_current_temperature_from_device(self, data: bytearray):
        temperature, = unpack("!d", bytes(data))
        tuple_to_send = (self._id, temperature)
        self._queue.put(tuple_to_send)