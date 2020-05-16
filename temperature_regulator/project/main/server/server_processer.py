from server.processer import Processer
import socket
from typing import Tuple, List, Union
from enum import Enum
from temperature_device.temperature_device_info_list import TemperatureDeviceInfoList
from struct import pack, unpack
from server.device_processer import DeviceProcesser
from queue import Queue
import threading


class ServerProcesser(Processer):
    class MessageType(Enum):
        CHANGE_CONFIG = "CHANGE_CONFIG"
        CHANGE_PARAMS = "CHANGE_PARAMS"
        CURR_DATA = "CURR_DATA"

    class ReturnMessageType(Enum):
        OK = "OK"

    def __init__(self, client_connection_socket: socket.socket, client_address_pair: Tuple[str, str],
                 devices_list: TemperatureDeviceInfoList):
        super().__init__(client_connection_socket, client_address_pair)
        self._devices_list = devices_list

    def run(self):
        self._threaded_print(f"Server thread started running. Client address: {self._address} Client port: {self._port}")
        data = self._receive_data()
        if data is None:
            return  # No data to process, so stop thread
        message_type, data = self._get_message_type_and_stripped_data(data)
        if message_type is None:
            self._threaded_print(f"Message type unrecognizable. Client address: {self._address} Client port: {self._port}")
            return
        else:
            queue = Queue()
            queue.devices_count = 0
            self._delegate_to_device_thread(message_type, data, queue)
            self._process_queue(message_type, queue)
        self._threaded_print(f"Server thread stopped running. Client address: {self._address} Client port: {self._port}")

    def _get_message_type_and_stripped_data(self, data: bytearray) -> Tuple[MessageType, bytearray]:
        message_type = None
        message_type = self._check_message_type(self.MessageType.CHANGE_CONFIG, data)
        if message_type is None:
            message_type = self._check_message_type(self.MessageType.CHANGE_PARAMS, data)
            if message_type is None:
                message_type = self._check_message_type(self.MessageType.CURR_DATA, data)
        if message_type is not None:
            return message_type, data[len(message_type.value):]
        return None, None

    def _check_message_type(self, potential_message_type: MessageType, data: bytearray) -> MessageType:
        message_type = data[:len(potential_message_type.value)]
        if message_type.decode(self.TEXT_ENCODING) == potential_message_type.value:
            return potential_message_type
        return None

    def _process_queue(self, message_type, queue: Queue):
        processed_messages_count = 0
        data_to_send_to_server = bytearray()
        while (processed_messages_count < queue.devices_count):
            message = queue.get(block=True)
            id, data = message
            id = bytearray(pack("!i", id))
            data_to_send_to_server.extend(id)
            if (data is not None):
                if (type(data) is int):
                    data = bytearray(pack("!i", data))
                elif (type(data) is str):
                    data = bytearray(data)
                data_to_send_to_server.extend(data)
            processed_messages_count += 1
        if message_type == self.MessageType.CHANGE_CONFIG or message_type == self.MessageType.CHANGE_PARAMS:
            sent = self._send_data(bytearray(self.ReturnMessageType.OK.value, encoding=self.TEXT_ENCODING))  # !!!!
        else:
            sent = self._send_data(data_to_send_to_server)
        if not sent:
            self._threaded_print(f"Could not send devices' data to client. Client address: {self._address} Client port: {self._port}")

    def _delegate_to_device_thread(self, message_type: MessageType, data: bytearray, queue: Queue):
        if message_type == self.MessageType.CHANGE_CONFIG:
            self._change_devices_config(data, queue)
        elif message_type == self.MessageType.CHANGE_PARAMS:
            self._change_devices_parameters(data, queue)
        elif message_type == self.MessageType.CURR_DATA:
            self._get_devices_current_data(queue)

    def _get_devices_info_from_data(self, data: bytearray) -> List[Tuple[int, bytearray, Tuple[str, int], float]]:
        devices_info_list = list()
        while len(data) > 0:
            id, data = data[:4], data[4:]
            id, = unpack("!i", id)
            public_key, data = data[:512], data[512:]
            packed_address, data = data[:4], data[4:]
            address = socket.inet_ntoa(packed_address)
            port, data = data[:4], data[4:]
            port, = unpack("!i", port)
            parameters, data = self._get_parameters_from_data(data)
            devices_info_list.append((id, public_key, (address, port), parameters))
        return devices_info_list

    def _get_parameters_from_data(self, data: bytearray) -> Tuple[float]:
        temperature = data[:8]
        temperature = unpack("!d", temperature)
        return temperature, data[8:]

    def _change_devices_config(self, data: bytearray, queue: Queue):
        devices_info_list = self._get_devices_info_from_data(data)
        for id, public_key, address, parameters in devices_info_list:
            self._devices_list.add_device_or_overwrite(id, public_key, address, parameters)
            self._send_parameters_to_device(id, address, parameters, queue)

    def _change_devices_parameters(self, data: bytearray, queue: Queue):
        while len(data) > 0:
            id, data = data[:4], data[4:]
            parameters, data = self._get_parameters_from_data(data)
            address = self._devices_list.get_devices_address(id)
            self._send_parameters_to_device(id, address, parameters, queue)

    def _send_parameters_to_device(self, id: int, address: Tuple[str, int], parameters: Tuple, queue: Queue):
        device_socket = self._connect_to_device(address)
        device_thread = DeviceProcesser(id, device_socket, address, queue)
        thread = threading.Thread(target=DeviceProcesser.run,
                                  args=(device_thread, 
                                        DeviceProcesser.SenderMessageType.CHANGE_TEMP, 
                                        parameters))
        thread.start()
        queue.devices_count += 1

    def _connect_to_device(self, address: Tuple[str, int]) -> socket.socket:
        device_socket = socket.create_connection(address)
        print(f"Connected to device. Address: {address[0]} Port: {address[1]}")
        return device_socket

    def _get_devices_current_data(self, address: Tuple[str, int], queue: Queue):
        devices = self._devices_list.get_all_devices_info()
        for id, devices_infos in devices:
            try:
                device_socket = self._connect_to_device(devices_infos.address)
            except OSError:
                ip, port = devices_infos.address
                self._threaded_print(f"Couldnt create socket for device! Device address: {ip} Device port: {port}")
                pass
            except socket.timeout:
                ip, port = devices_infos.address
                self._threaded_print(f"Couldnt connect to device! Device address: {ip} Device port: {port} ")
                pass
            device_thread = DeviceProcesser(id, device_socket, devices_infos.address, queue)
            thread = threading.Thread(target=DeviceProcesser.run,
                                      args=(device_thread, DeviceProcesser.SenderMessageType.GET_TEMP, None))
            thread.start()
            queue.devices_count += 1
