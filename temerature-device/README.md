# How to install

## In order to run this app you need to follow these seps:
- go to this [link](https://www.cryptopp.com/downloads.html "Crypto++") and download the Crypto++ 8.2.0
- unpack the library and paste those lines 
```shell script
cd cryptopp820
make static dynamic test
```
- go to `CMakeLists.txt` file in root directory and replace all occurences of `/Users/jaroslaw.glegola/cryptopp820` to your absolute path of `cryptopp820`
- run 
```shell script
cmake -DCMAKE_BUILD_TYPE=Debug -D CMAKE_CXX_COMPILER=clang++ -G "CodeBlocks - Unix Makefiles" ./temerature-device
```
Install needed libraries. This probably won't work so concact me if you encounter any problems at `jiirra@gmail.com`
