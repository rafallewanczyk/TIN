import unittest
import tempfile
from main.config_loader.txt_config_loader import TxtConfigLoader


class TxtConfigLoaderTestCase(unittest.TestCase):
    def setUp(self):
        self._file = tempfile.NamedTemporaryFile(mode="w+t")

    def tearDown(self):
        self._file.close()

    def add_data_to_file(self, data: str):
        self._file.write(data)
        self._file.seek(0)

    def test_listenerSocketAddress_EmptyFile_ThrowsKeyError(self):
        data = ""
        self.add_data_to_file(data)
        config = TxtConfigLoader(self._file)
        self.assertRaises(KeyError, lambda: config.listener_socket_address)
    
    def test_listenerSocketAddress_ListenerSocketAddressInfo_ReturnsExpectedAddress(self):
        data = 'listener socket address:127.0.0.1'
        self.add_data_to_file(data)
        config = TxtConfigLoader(self._file)
        self.assertEquals('127.0.0.1', config.listener_socket_address)

    def test_listenerSocketAddress_ListenerSocketAddressInfoWithSpaces_ReturnsExpectedAddress(self):
        data = '   listener socket address  :  127.0.0.1  '
        self.add_data_to_file(data)
        config = TxtConfigLoader(self._file)
        self.assertEquals('127.0.0.1', config.listener_socket_address)

    def test_listenerSocketAddress_ListenerSocketAddressInfoWithEmptyLine_ReturnsExpectedAddress(self):
        data = '\nlistener socket address:127.0.0.1'
        self.add_data_to_file(data)
        config = TxtConfigLoader(self._file)
        self.assertEquals('127.0.0.1', config.listener_socket_address)
    
    def test_listenerSocketAddress_ListenerSocketAddressInfoWithComment_ReturnsExpectedAddress(self):
        data = 'listener socket address:127.0.0.1 # A comment '
        self.add_data_to_file(data)
        config = TxtConfigLoader(self._file)
        self.assertEquals('127.0.0.1', config.listener_socket_address)
    
    def test_listenerSocketPort_MultipleInfosWithComments_ReturnsExpectePort(self):
        data = """listener socket address :  127.0.0.1 # A comment \n
               listener socket timeout : 1 #Second comment\n'
               listener socket port : 8080\n"""
        self.add_data_to_file(data)
        config = TxtConfigLoader(self._file)
        self.assertEquals(8080, config.listener_socket_port)


if __name__ == '__main__':
    unittest.main()