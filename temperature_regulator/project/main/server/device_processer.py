from server.processer import Processer
import socket
from typing import Tuple
from enum import Enum
from struct import pack, unpack
from queue import Queue


class DeviceProcesser(Processer):
    class MessageType(Enum):
        CHANGE_TEMP = "CHANGE_TEMP"
        GET_TEMP = "GET_TEMP"

    class ReceivedMessageType(Enum):
        CURR_TEMP = "CURR_TEMP"

    def __init__(self, id: int, device_connection_socket: socket.socket, device_address_pair: Tuple[str, str], queue: Queue):
        super().__init__(device_connection_socket, device_address_pair)
        self._id = id
        self._queue = queue

    def run(self, sender_message_type: MessageType, data_to_send: Tuple):
        self._threaded_print(f"Device thread started running. Device address: {self._address} Device port: {self._port}")
        sent = self._send_request(sender_message_type, data_to_send)
        if not sent:
            self._queue.put((self._id, None))
            return
        data = self._receive_data()
        if data is None:
            self._queue.put((self._id, None))
            return
        if len(data) == 0:
            self._queue.put((self._id, 0))
            return
        message_type, data = self._get_message_type_and_stripped_data(data)
        if message_type is None:
            self._threaded_print(f"Message type unrecognizable. Device address: {self._address} Device port: {self._port}")
            self._queue.put((self._id, None))
            return
        else:
            self._process_data(message_type, data)

    def _send_request(self, sender_message_type: MessageType, data_to_send: Tuple):
        if(sender_message_type == self.MessageType.GET_TEMP):
            return self._request_temperature_from_device()
        elif(sender_message_type == self.MessageType.CHANGE_TEMP):
            temperature, = data_to_send
            return self._request_change_device_temperature(temperature)
        else:
            self._threaded_print(f"Message type for device unrecognizable! Device address: {self._address} Device port: {self._port}")
            return False

    def _request_change_device_temperature(self, temperature: float):
        data = bytearray(self.MessageType.CHANGE_TEMP.value, encoding=self.TEXT_ENCODING)
        temperature = pack("!d", temperature)
        data.extend(bytearray(temperature))
        return self._send_data(data)

    def _request_temperature_from_device(self):
        data_to_send = bytearray(self.MessageType.GET_TEMP.value)
        return self._send_data(data_to_send)

    def _get_message_type_and_stripped_data(self, data: bytearray) -> Tuple[MessageType, bytearray]:
        message_type = self._check_message_type(self.ReceivedMessageType.CURR_TEMP, data)
        if message_type is None:
            return None, None
        return message_type, data[len(message_type):]


    def _check_message_type(self, potential_message_type: ReceivedMessageType, data: bytearray) -> MessageType:
        message_type = data[:len(potential_message_type)]
        if message_type.decode(self.TEXT_ENCODING) == potential_message_type:
            return potential_message_type
        return None

    def _process_data(self, message_type: MessageType, data: bytearray):
        if message_type == self.MessageType.CURR_TEMP:
            self._process_current_temperature_from_device(data)

    def _process_current_temperature_from_device(self, data: bytearray):
        temperature, = unpack("!d", bytes(data))
        self._queue.put((self._id, temperature))
