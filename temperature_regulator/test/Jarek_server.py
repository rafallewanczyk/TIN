import socket
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
    while True:
        if amount_of_bytes - 500 > 0:
            data.extend(portion)
            portion = connection_socket.recv(500)
            amount_of_bytes -= 500
        else:
            data.extend(portion[:amount_of_bytes])
            break
    return data[12:]


def check_message_type(tested_msg_type, data):
    msg_type = data[:len(tested_msg_type)].decode("utf-8")
    return msg_type == tested_msg_type


def process_data_from(connection_socket, client_address):
    data = receive_from_host(connection_socket)
    handler = cryptography_handler.CryptographyHandler("Jarek_server_key.private", "../test_only_key.public")
    data, signature = data[:-256], data[-256:]
    data = handler.decrypt_data(data[:256])
    handler.check_signature(data, signature)
    global TEMPERATURE
    if check_message_type("CHANGE_TEMP", data):
        temp, = unpack("!d", data[len("CHANGE_TEMP"):])
        TEMPERATURE = temp
        print(f"Current temperature set: {TEMPERATURE}")
    if check_message_type("GET_TEMP", data):
        print(f"Temperature sent: {TEMPERATURE}")
        data = get_curr_temp_body()
        signature = handler.create_signature(data)
        data = handler.encrypt_data(data)
        header = create_header(1, 12 + len(data) + len(signature), 0)
        data_to_send = header+data+signature
        connection_socket.sendall(data_to_send)
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