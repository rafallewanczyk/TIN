import socket
import sys
import time

if __name__ == "__main__":
    receiver_address = ('127.0.0.1', 8080)
    try:
        client_socket = socket.create_connection(receiver_address)
    except OSError as err:
        print("Cannot connect to server!")
        print(str(err))
        sys.exit(1)
    time.sleep(5)
    # with client_socket:    
        # data = 'Hello world'
        # client_socket.sendall(data.encode(encoding='utf-8'))
        # print("Data sent")