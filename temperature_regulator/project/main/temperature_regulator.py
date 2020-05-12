from server.dispatcher import ServerDispatcher
from config_handling.txt_config_handler import TxtConfigHandler


def main():
    loader = TxtConfigHandler("server_configuration.config")
    server = ServerDispatcher(loader)
    server.run()


if __name__ == "__main__":
    main()
