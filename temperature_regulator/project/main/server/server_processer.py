from processer import Processer
import socket
from typing import Tuple, List
from enum import Enum
from temperature_device.temperature_device_info_list import TemperatureDeviceInfoList
from struct import unpack
from device_processer import DeviceProcesser
from Queue import Queue


class ServerProcesser(Processer):
    class MessageType(Enum):
        CHANGE_CONFIG = "CHANGE_CONFIG"
        CHANGE_PARAMS = "CHANGE_PARAMS"
        CURR_DATA = "CURR_DATA"

    def __init__(self, client_connection_socket: socket.socket, client_address_pair: Tuple[str, str], devices_list: TemperatureDeviceInfoList):
        super().__init__(client_connection_socket, client_address_pair)
        self._devices_list = devices_list

    def run(self):
        self._threaded_print(f"Server thread {self._id} started running. Client address: {self._client_address} Client port: {self._client_port}")
        data = self._receive_data()
        message_type, data = self._get_message_type_and_stripped_data(data)
        if message_type is None:
            pass  # TODO: send info that message type unrecognizable
        else:
            queue = Queue()
            queue.devices_count = 0
            self._process_data(message_type, data)
            self._process_queue(queue)
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
            return message_type, data[len(message_type):]
        return None

    def _check_message_type(self, potential_message_type: MessageType, data: bytearray) -> MessageType:
        message_type = data[:len(potential_message_type)]
        if message_type.decode(self.TEXT_ENCODING) == potential_message_type:
            return potential_message_type
        return None

    def _process_queue(self, queue: Queue):
        received_messages_count = 0
        data_to_send_to_server = bytearray()
        while(received_messages_count < queue.devices_count):
            message = queue.get(block=True)
            id, data = message
            id = bytearray(pack("!i", id))
            data_to_send_to_server.extend(id)
            if(type(data) is int):
                data = bytearray(pack("!i", id))
            elif(type(data) is str):
                data = bytearray(data)
            data_to_send_to_server.extend(data)
        self._send_data(data_to_send_to_server)


    def _process_data(self, message_type: MessageType, data: bytearray, queue: Queue):
        if message_type == self.MessageType.CHANGE_CONFIG:
            self._change_devices_config(data, queue)
        elif message_type == self.MessageType.CHANGE_PARAMS:
            self._change_devices_parameters(data, queue)
        elif message_type == self.MessageType.CURR_DATA:
            self._get_devices_current_data(queue)

    def _get_devices_info_from_data(self, data: bytearray) -> List[Tuple[int, bytearray, str, float]]:
        devices_info_list = list()
        while len(data) > 0:
            id, data = data[:4], data[4:]
            id = int.from_bytes(id, byteorder=self.BYTEORDER)
            # public_key, data = data[:512], data[512:]
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

    def _change_devices_config(self, data: bytearray, queue: Queue):
        devices_info_list = self._get_devices_info_from_data(data)
        # TODO: Check correctness
        for id, public_key, address, parameters in devices_info_list:
            self._devices_list.add_device_or_overwrite(id, public_key, address, parameters)
            self._send_parameters_to_device(id, address, parameters, queue)

    def _change_devices_parameters(self, data: bytearray, queue: Queue):
        while len(data) > 0:
            id, data = data[:4], data[4:]
            parameters, data = self._get_parameters_from_data(data)
            address = self._devices_list.get_devices_address(id)
            self._send_parameters_to_device(address, parameters, queue)

    def _send_parameters_to_device(self, id: int, address: Tuple[str, int], parameters: Tuple, queue: Queue):
        device_socket = self._connect_to_device(address)
        device_thread = DeviceProcesser(id, device_socket, address, queue)
        device_thread.run(DeviceProcesser.SenderMessageType.CHANGE_TEMP, parameters)

    def _connect_to_device(self, address: Tuple[str, int]) -> socket.socket:
        try:
            device_socket = socket.create_connection(address)
        except OSError:
            print("Couldnt create socket for device!")
            return
        except socket.timeout:
            print("Couldnt connect to device!")
            return
        print(f"Connected to device. Address: {self._config_handler.listener_socket_address} Port: {self._loader.listener_socket_port}")
        return device_socket

    def _get_devices_current_data(self, address: Tuple[str, int], queue: Queue):
        devices = self._devices_list.get_all_devices_info()
        for id, devices_infos in devices:
            device_socket = self._connect_to_device(devices_infos.address)
            device_thread = DeviceProcesser(id, device_socket, devices_infos.address, queue)
            device_thread.run(DeviceProcesser.SenderMessageType.GET_TEMP)
            queue.devices_count += 1
