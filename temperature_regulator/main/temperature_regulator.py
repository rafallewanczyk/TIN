from server_dispatcher import ServerDispatcher


def main():
    server = ServerDispatcher(port=35000)
    server.run()


if __name__ == "__main__":
    main()