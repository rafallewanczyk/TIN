from server.dispatcher import ServerDispatcher
from config_loader.txt_config_loader import TxtConfigLoader


def main():
    loader = TxtConfigLoader("server_configuration.config")
    server = ServerDispatcher(loader)
    server.run()


if __name__ == "__main__":
    main()
