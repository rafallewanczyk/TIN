cmake_minimum_required(VERSION 3.15)
project(untitled)

set(CMAKE_CXX_STANDARD 17)

include_directories(/Users/jaroslaw.glegola/cryptopp820)

find_library(crypto libcryptopp.dylib PATHS /Users/jaroslaw.glegola/cryptopp820)
message("LIBRARIES = ${crypto}")

add_executable(AProgram main.cpp src/server/server.hpp src/server/socket-initialisation-exception.hpp src/server/accept-connection-exception.hpp src/security/security-module.hpp src/security/key-generator.hpp)
add_executable(test test/catch.hpp test/maintest.cpp src/security/__tests__/key-generator-test.cpp)
target_link_libraries(AProgram ${crypto})
target_link_libraries(test ${crypto})
