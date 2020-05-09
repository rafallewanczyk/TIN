from processer import Processer
import socket
from typing import Tuple


class ServerProcesser(Processer):
    def __init__(self,  id: int, client_connection_socket: socket.socket, client_address_pair: Tuple[str, str]):
        super().__init__(id, client_connection_socket, client_address_pair)

    def run(self):
        self._threaded_print(f"Server thread {self._id} started running. Client address: {self._client_address} Client port: {self._client_port}")
        try:
            data = self._receive_data()
        except socket.timeout:
            self._threaded_print(f"No data to read for a long time!")
        else:
            self._process_received_data(data)
        self._print_closing_message()

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
        