import socket
import sys
from struct import pack, unpack
from sys import argv
import cryptography_handler


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
    return data[12:]


def get_change_config_body_with_public_key():
    pem_key = None
    with open("Jarek_server_key.public", 'rb') as pem_file:
        pem_key = pem_file.read()
    return (bytes(bytearray("CHANGE_CONFIG", 'utf-8')) +  # Type
            pack("!i", 0) + pack("!ii", 8081, len("127.0.0.1")) +  # id, port, address length
            bytes(bytearray("127.0.0.1", 'utf-8')) +  # address
            pack("!i", len(pem_key)) + pem_key  # size of key, key
            + pack("!d", 50)  # parameters 
            )


def get_current_temperature_body():
    return bytes(bytearray("CURR_DATA", 'utf-8'))


def get_change_params_body():
    return bytes(bytearray("CHANGE_PARAMS", 'utf-8')) + pack("!id", 0, 66.0)


def check_message_type(tested_msg_type, data):
    msg_type = data[:len(tested_msg_type)].decode("utf-8")
    return msg_type == tested_msg_type


def print_received_data(data):
    if int(argv[1]) == 0:
        print(data)
    elif int(argv[1]) == 1:
        data = data[len("CURRENT_DATA_RES"):]
        data = data[2:]
        while len(data) > 0:
            id, temp = unpack("!id", data[:12])
            data = data[12:]
            print(f"Device {id} temperature: {temp}")
    elif int(argv[1]) == 2:
        print(data)


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
        handler = cryptography_handler.CryptographyHandler("Kacper_client_key.private", "../test_only_key.public")
        signature = handler.create_signature(data)
        data = handler.encrypt_data(data)
        header = create_header(1, 12 + len(data) + len(signature), 0)
        data_to_send = header+data+signature
        client_socket.sendall(data_to_send)
        print("Data sent")
        client_socket.settimeout(3)
        data = receive_from_host(client_socket)
        data, signature = data[:-256], data[-256:]
        data = handler.decrypt_data(data[:256])
        handler.check_signature(data, signature)
        print_received_data(data)  # Without header