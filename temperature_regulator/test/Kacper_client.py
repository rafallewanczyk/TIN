import socket
import sys
from struct import pack, unpack
from sys import argv
import cryptography_handler

SECURE = True

def create_header(protocol_version, amount_of_bytes, id):
    return pack("!iii", protocol_version, amount_of_bytes, id)


def process_header(data):
    return unpack("!iii", data[:12])


def receive_from_host(connection_socket) -> bytearray:
    data = bytearray()
    portion = connection_socket.recv(500)
    if not portion:
        return data
    protocol_version, amount_of_bytes, sender_id = process_header(portion)
    print(f"Header: {protocol_version} {amount_of_bytes} {sender_id}")
    while True:
        if amount_of_bytes - 500 > 0:
            data.extend(portion)
            portion = connection_socket.recv(500)
            amount_of_bytes -= 500
        else:
            data.extend(portion[:amount_of_bytes])
            break
    print(f"Data: {data[12:].decode(encoding='unicode_escape')}")
    return data[12:]


def get_change_config_body():
    return bytes(bytearray("CHANGE_CONFIG", 'utf-8')) + pack("!iiid", 0, 2130706433, 8081, 50.0)


def get_change_config_body_with_public_key():
    pem_key = None
    with open("Jarek_server_key.public", 'rb') as pem_file:
        pem_key = pem_file.read()
    return bytes(bytearray("CHANGE_CONFIG", 'utf-8')) + pack("!i", 0) + pem_key + pack("!iid", 2130706433, 8081, 50.0)


def get_current_temperature_body():
    return bytes(bytearray("CURR_DATA", 'utf-8'))


def get_change_params_body():
    return bytes(bytearray("CHANGE_PARAMS", 'utf-8')) + pack("!id", 0, 66.0)


def check_message_type(tested_msg_type, data):
    msg_type = data[:len(tested_msg_type)].decode("utf-8")
    return msg_type == tested_msg_type


def print_received_data(data):
    if int(argv[1]) == 1:
        while len(data) > 0:
            id, temp = unpack("!id", data[:12])
            data = data[12:]
            print(f"Device {id} temperature: {temp}")


if __name__ == "__main__":
    if len(argv) < 2:
        print("Specify message body")
        sys.exit(1)
    receiver_address = ('127.0.0.1', 42031)
    try:
        client_socket = socket.create_connection(receiver_address)
    except OSError as err:
        print("Cannot connect to server!")
        print(str(err))
        sys.exit(2)
    with client_socket:
        if int(argv[1]) == 0:
            data = get_change_config_body_with_public_key()
        elif int(argv[1]) == 1:
            data = get_current_temperature_body()
        elif int(argv[1]) == 2:
            data = get_change_params_body()
        cryptography_handler = cryptography_handler.CryptographyHandler("Kacper_client_key.private", "../test_only_key.public")
        signature = cryptography_handler.create_signature(data)
        # data = cryptography_handler.encrypt_data(data)
        header = create_header(1, 12 + 256 + len(data) + len(signature), 0)
        data_to_send = header+data+signature
        client_socket.sendall(data_to_send)
        print("Data sent")
        client_socket.settimeout(3)
        data = receive_from_host(client_socket)
        print_received_data(data)  # Without header