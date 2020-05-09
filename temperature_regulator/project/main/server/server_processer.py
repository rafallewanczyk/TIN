from processer import Processer
import socket
from typing import Tuple, List
from enum import Enum
from temperature_device.temperature_device_info_list import TemperatureDeviceInfoList
from struct import unpack


class ServerProcesser(Processer):
    class MessageType(Enum):
        CHANGE_CONFIG = "CHANGE_CONFIG"
        CHANGE_PARAMS = "CHANGE_PARAMS"
        CURR_DATA = "CURR_DATA"

    def __init__(self,  id: int, client_connection_socket: socket.socket, client_address_pair: Tuple[str, str], devices_list: TemperatureDeviceInfoList):
        super().__init__(id, client_connection_socket, client_address_pair)
        self._devices_list = devices_list

    def run(self):
        self._threaded_print(f"Server thread {self._id} started running. Client address: {self._client_address} Client port: {self._client_port}")
        data = self._receive_data()
        message_type, data = self._get_message_type_and_stripped_data(data)
        if message_type is None:
            pass  # TODO: send info that message type unrecognizable
        else:
            self._process_data(message_type, data)
        self._print_closing_message()

    def _get_message_type_and_stripped_data(self, data: bytearray) -> Tuple[MessageType, bytearray]:
        message_type = None
        message_type = self._check_message_type(self.MessageType.CHANGE_CONFIG, data)
        if message_type is None:
            message_type = self._check_message_type(self.MessageType.CHANGE_PARAMS, data)
            if message_type is None:
                message_type = self._check_message_type(self.MessageType.CURR_DATA, data)
                if message_type is None:
                    pass
        if message_type is not None:
            return self.MessageType.CHANGE_CONFIG, data[len(message_type):]
        return None

    def _check_message_type(self, potential_message_type: MessageType, data: bytearray) -> MessageType:
        message_type = data[:len(potential_message_type)]
        if message_type.decode(self.TEXT_ENCODING) == potential_message_type:
            return potential_message_type
        return None

    def _process_data(self, message_type: MessageType, data: bytearray):
        if message_type == self.MessageType.CHANGE_CONFIG:
            self._change_devices_config(data)
        elif message_type == self.MessageType.CHANGE_PARAMS:
            self._change_devices_parameters(data)
        elif message_type == self.MessageType.CURR_DATA:
            self._get_current_devices_data()

    def _get_devices_info_from_data(self, data: bytearray) -> List[Tuple[int, bytearray, str, float]]:
        devices_info_list = list()
        while len(data) > 0:
            id, data = data[:4], data[4:]
            id = int.from_bytes(id, byteorder=self.BYTEORDER)
            public_key, data = data[:512], data[512:]
            address, data = data[:4], data[4:]
            try:
                address = socket.inet_ntoa(bytes(address))
            except OSError:
                address = None
            parameters, data = self._get_parameters_from_data(data)
            devices_info_list.append((id, public_key, address, parameters))
        return devices_info_list

    def _get_parameters_from_data(self, data: bytearray) -> Tuple[float]:
        temperature = data[:4]
        temperature = unpack("!d", bytes(temperature))  # Convert to double
        return temperature,

    def _change_devices_config(self, data: bytearray):
        devices_info_list = self._get_devices_info_from_data(data)
        # TODO: Check correctness
        for id, public_key, address, parameters in devices_info_list:
            self._devices_list.add_device_or_overwrite(id, public_key, address, parameters)
            self._send_parameters_to_device(address, parameters)

    def _change_devices_parameters(self, data: bytearray):
        while len(data) > 0:
            id, data = data[:4], data[4:]
            parameters, data = self._get_parameters_from_data(data)
            address = devices_info_list.get_devices_address(id)
            self._send_parameters_to_device(address, parameters)

    def _send_parameters_to_device(self, address: Tuple[str, int], parameters: Tuple):
        pass

    def _get_current_devices_data(self):
        pass
