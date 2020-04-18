#include <osrng.h>
#include <files.h>
#include "src/server/server.hpp"
#include "src/connection-handler/connection-handler.hpp"
#include "rsa.h"
#include "src/security/security-module.hpp"

int main(int argc, char *argv[]) {
//    auto server = Server("20001");
//    server.run(ConnectionHandler::getConnectionHandler);
    SecurityModule security("regulator.public.rsa");

    auto message = "Jarek";
    auto signature = security.makeSignature(message);
    auto isVerified = security.verifySignature(message, signature);
    std::cout << isVerified << std::endl;

    return 0;
}