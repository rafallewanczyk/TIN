#include <iostream>
#include "cryptlib.h"
#include "sha.h"
#include <vector>

void x() {

}

int main() {
    std::cout << "Hello, World!" << std::endl;

    CryptoPP::SHA1 hash;
    std::cout << "Name: " << hash.AlgorithmName() << std::endl;
    std::cout << "Digest size: " << hash.DigestSize() << std::endl;
    std::cout << "Block size: " << hash.BlockSize() << std::endl;


    return 0;
}
