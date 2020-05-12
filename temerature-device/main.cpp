#include <osrng.h>
#include <files.h>
#include <netdb.h>
#include "src/server/server.hpp"
#include "src/connection-handler/connection-handler.hpp"
#include "src/device/device-handler.hpp"

using namespace std;

int main(int argc, char *argv[]) {
    auto device = std::make_shared<Device>();
    auto deviceHandler = DeviceHandler(device);
    std::thread handlerThread(std::ref(deviceHandler));

    Server("20001").run(ConnectionHandler::getConnectionHandler, device);


    return 0;
}