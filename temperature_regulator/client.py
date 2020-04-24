import socket

if __name__ == "__main__":
    receiver_address = ('127.0.0.1', 8080)
    client_socket = socket.create_connection(receiver_address)
    data = 'Hello world'
    client_socket.sendall(data.encode(encoding='utf-8'))
    print("Data sent")