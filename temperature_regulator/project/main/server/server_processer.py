from server.processer import Processer
import socket
from typing import Tuple, List
from enum import Enum
from device.device_info_list import DeviceInfoList
from struct import pack, unpack
from server.device_processer import DeviceProcesser
from queue import Queue
import threading
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.serialization import load_pem_public_key
from cryptography.hazmat.backends import default_backend


class ServerProcesser(Processer):
    class MessageType(Enum):
        CHANGE_CONFIG = "CHANGE_CONFIG"
        CHANGE_PARAMS = "CHANGE_PARAMS"
        CURR_DATA = "CURR_DATA"

    class ReturnMessageType(Enum):
        CURRENT_DATA_RES = "CURRENT_DATA_RES"
        CHANGE_PARAMS_RE = "CHANGE_PARAMS_RE"
        CHANGE_CONFIG_RE = "CHANGE_CONFIG_RE"

    def __init__(self, client_connection_socket: socket.socket, client_address_pair: Tuple[str, str],
                 devices_list: DeviceInfoList):
        super().__init__(client_connection_socket, client_address_pair)
        self._devices_list = devices_list

    def run(self):
        self._threaded_print(f"Server thread started running. Client address: {self._address} Client port: {self._port}")
        data = self._receive_data()
        if data is None:
            self._threaded_print(f"Server thread stopped running. Client address: {self._address} Client port: {self._port}")
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
            if data is not None:
                if (type(data) is int):
                    data = bytearray(pack("!i", data))
                elif (type(data) is str):
                    data = bytearray(data)
                elif (type(data) is float):
                    data = bytearray(pack("!d", data))
                data_to_send_to_server.extend(data)
            else:
                if message_type == CURR_DATA:
                    data_to_send_to_server.append(pack("!d", -300))
                elif message_type == CHANGE_PARAMS:
                    data_to_send_to_server.append(pack("!i", 2))
            processed_messages_count += 1
        self._send_answer(message_type, data_to_send_to_server)

    def _send_answer(self, message_type: MessageType, data_to_send: bytearray):
        if message_type == self.MessageType.CHANGE_CONFIG:
            beginning = bytearray(self.ReturnMessageType.CHANGE_CONFIG_RE.value, "utf-8")
            sent = self._send_data(beginning)
        elif message_type == self.MessageType.CHANGE_PARAMS:
            beginning = bytearray(self.ReturnMessageType.CHANGE_PARAMS_RE.value, "utf-8")
            sent = self._send_data(beginning + data_to_send)
        elif message_type == self.MessageType.CURR_DATA:
            beginning = bytearray(self.ReturnMessageType.CURRENT_DATA_RES.value, "utf-8") + pack("!h", 0)
            sent = self._send_data(beginning + data_to_send)
        if not sent:
            self._threaded_print(f"Could not send devices' data to client. Client address: {self._address} Client port: {self._port}")

    def _delegate_to_device_thread(self, message_type: MessageType, data: bytearray, queue: Queue):
        if message_type == self.MessageType.CHANGE_CONFIG:
            self._change_devices_config(data, queue)
        elif message_type == self.MessageType.CHANGE_PARAMS:
            self._change_devices_parameters(data, queue)
        elif message_type == self.MessageType.CURR_DATA:
            self._get_devices_current_data(queue)

    def _get_devices_info_from_data(self, data: bytearray) -> List[Tuple[int, rsa.RSAPublicKey, Tuple[str, int], float]]:
        devices_info_list = list()
        while len(data) > 0:
            id, data = data[:4], data[4:]
            id, = unpack("!i", id)
            port, data = data[:4], data[4:]
            port, = unpack("!i", port)
            address_size, data = data[:4], data[4:]
            address_size, = unpack("!i", address_size)
            address, data = data[:address_size].decode("utf-8"), data[address_size:]
            public_key_size, data = data[:4], data[4:]
            public_key_size, = unpack("!i", public_key_size)
            if self._cryptography_handler is not None:
                public_key_bytes, data = data[:public_key_size], data[public_key_size:]
                public_key = load_pem_public_key(public_key_bytes, default_backend())
            else:
                public_key = None
            parameters, data = self._get_parameters_from_data(data)
            devices_info_list.append((id, public_key, (address, port), parameters))
            print(f"{id} {port} {address} {public_key_size} {parameters}")
        return devices_info_list

    def _get_parameters_from_data(self, data: bytearray) -> Tuple[float]:
        temperature = data[:8]
        temperature = unpack("!d", temperature)
        return temperature, data[8:]

    def _change_devices_config(self, data: bytearray, queue: Queue):
        devices_info_list = self._get_devices_info_from_data(data)
        for id, public_key, address, parameters in devices_info_list:
            self._devices_list.add_device_or_overwrite(id, public_key, address, parameters)
            self._send_parameters_to_device(id, address, public_key, parameters, queue)

    def _change_devices_parameters(self, data: bytearray, queue: Queue):
        while len(data) > 0:
            id, data = data[:4], data[4:]
            id, = unpack("!i", id)
            parameters, data = self._get_parameters_from_data(data)
            address = self._devices_list.get_devices_address(id)
            public_key = self._devices_list.get_devices_public_key(id)
            if address is None:
                queue.put((id, 1))
            else:
                self._send_parameters_to_device(id, address, public_key, parameters, queue)

    def _send_parameters_to_device(self, id: int, address: Tuple[str, int], public_key: rsa.RSAPublicKey, parameters: Tuple, queue: Queue):
        try:
            device_socket = self._connect_to_device(address)
        except OSError:
            ip, port = address
            queue.put((id, None))
            self._threaded_print(f"Couldnt create socket for device! Device address: {ip} Device port: {port}")
            return
        except socket.timeout:
            ip, port = address
            queue.put((id, None))
            self._threaded_print(f"Couldnt connect to device! Device address: {ip} Device port: {port} ")
            return
        device_thread = DeviceProcesser(id, device_socket, address, public_key, queue)
        thread = threading.Thread(target=DeviceProcesser.run,
                                  args=(device_thread,
                                        DeviceProcesser.MessageType.CHANGE_TEMP,
                                        parameters))
        thread.start()
        queue.devices_count += 1

    def _connect_to_device(self, address: Tuple[str, int]) -> socket.socket:
        device_socket = socket.create_connection(address)
        print(f"Connected to device. Address: {address[0]} Port: {address[1]}")
        return device_socket

    def _get_devices_current_data(self, queue: Queue):
        devices = self._devices_list.get_all_devices_info()
        for id, devices_infos in devices.items():
            try:
                device_socket = self._connect_to_device(devices_infos.address)
            except OSError:
                ip, port = devices_infos.address
                queue.put((id, None))
                self._threaded_print(f"Couldnt create socket for device! Device address: {ip} Device port: {port}")
                continue
            except socket.timeout:
                ip, port = devices_infos.address
                queue.put((id, None))
                self._threaded_print(f"Couldnt connect to device! Device address: {ip} Device port: {port} ")
                continue
            device_thread = DeviceProcesser(id, device_socket, devices_infos.address, devices_infos.public_key, queue)
            thread = threading.Thread(target=DeviceProcesser.run,
                                      args=(device_thread, DeviceProcesser.MessageType.GET_TEMP, None))
            thread.start()
            queue.devices_count += 1
