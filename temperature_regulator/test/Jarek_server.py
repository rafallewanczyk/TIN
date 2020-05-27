import socket
import sys
from struct import pack, unpack
import cryptography_handler


LISTENER_SOCKET_ADDRESS = "127.0.0.1"
LISTENER_SOCKET_PORT = 8081
TEMPERATURE = 36.6


def create_header(protocol_version, amount_of_bytes, id):
    return pack("!iii", protocol_version, amount_of_bytes, id)


def create_listener_socket():
    try:
        listener_socket = socket.socket(family=socket.AF_INET, type=socket.SOCK_STREAM)
    except OSError:
        print("Couldnt create socket!")
        exit(2)
    listener_socket.bind((LISTENER_SOCKET_ADDRESS, LISTENER_SOCKET_PORT))
    listener_socket.listen(5)
    listener_socket.settimeout(1)
    print(f"Server created. Interface: {LISTENER_SOCKET_ADDRESS} Port: {LISTENER_SOCKET_PORT}")
    return listener_socket


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


def check_message_type(tested_msg_type, data):
    msg_type = data[:len(tested_msg_type)].decode("utf-8")
    return msg_type == tested_msg_type


def process_data_from(connection_socket, client_address):
    data = receive_from_host(connection_socket)
    global TEMPERATURE
    if check_message_type("CHANGE_TEMP", data):
        temp, = unpack("!d", data[len("CHANGE_TEMP"):])
        TEMPERATURE = temp
        print(f"Current temperature set: {TEMPERATURE}")
    if check_message_type("GET_TEMP", data):
        print(f"Temperature sent: {TEMPERATURE}")
        data = get_curr_temp_body()
        header = create_header(1, 12 + len(data), 0)
        connection_socket.sendall(header+data)
        print("Data sent")
    connection_socket.close()


def get_curr_temp_body():
    global TEMPERATURE
    return bytes(bytearray("CURR_TEMP", 'utf-8')) + pack("!d", TEMPERATURE)


if __name__ == "__main__":
    listener_socket = create_listener_socket()
    try:
        while (True):
            try:
                connection_socket, client_address = listener_socket.accept()
            except socket.timeout:
                pass
            except OSError:
                print("Couldnt create ephemeral socket for connection")
                listener_socket.close()
                break
            else:
                process_data_from(connection_socket, client_address)
    except KeyboardInterrupt:  # SIGINT
        listener_socket.close()