cmake_minimum_required(VERSION 3.15)
project(untitled)

set(CMAKE_CXX_STANDARD 17)

include_directories(/Users/jaroslaw.glegola/cryptopp820)

find_library(crypto libcryptopp.dylib PATHS /Users/jaroslaw.glegola/cryptopp820)
message("LIBRARIES = ${crypto}")

add_executable(AProgram main.cpp src/server/server.hpp src/server/socket-initialisation-exception.hpp src/server/accept-connection-exception.hpp src/security/security-module.hpp src/security/key-generator.hpp src/device/device.hpp src/security/regulator-keys-not-found.hpp src/connection-handler/connection-lost-during-read-exception.hpp src/utils/errno-exception.hpp src/connection-handler/header-handler.hpp src/connection-handler/data-reader.hpp src/connection-handler/data-sender.hpp src/connection-handler/data-parser.hpp)
add_executable(ClientProgram main1.cpp)
add_executable(test test/catch.hpp test/maintest.cpp src/security/__tests__/key-generator-test.cpp src/security/__tests__/security-module-test.cpp src/device/__tests__/device-test.cpp)
target_link_libraries(AProgram ${crypto})
target_link_libraries(test ${crypto})
