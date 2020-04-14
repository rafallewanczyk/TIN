#include "src/server/server.hpp"
#include "src/connection-handler/connection-handler.hpp"

int main(int argc, char *argv[]) {
    auto server = Server("20001");
    server.run(ConnectionHandler::getConnectionHandler);
}