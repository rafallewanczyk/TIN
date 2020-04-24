import socket

if __name__ == "__main__":
    with socket.socket(family=socket.AF_INET, type=socket.SOCK_STREAM) as listener_socket:
        # Faza konfiguracji
        listener_address = ('', 8080)
        listener_socket.bind(listener_address)
        listener_socket.listen()
        # Faza odbierania połączenia
        connection_socket, connector_address = listener_socket.accept()
        print(f"Connected by: {connector_address}")
        with connection_socket:
            # Faza odbierania wiadomości
            data = bytearray()
            while True:
                portion = connection_socket.recv(8)
                if not portion:
                    break
                data.extend(portion)
            # Faza przetwarzania
            print(data.decode(encoding="utf-8"))