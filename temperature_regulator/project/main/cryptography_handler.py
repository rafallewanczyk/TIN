from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.serialization import load_pem_private_key, load_pem_public_key
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import hashes
from cryptography.exceptions import InvalidSignature
from typing import List


class CryptographyHandler:
    def __init__(self, private_key_path: str, servers_public_keys_paths: List[str]):
        private_key_pem = self._get_pem_from_file(private_key_path)
        self._regulator_private_key = load_pem_private_key(data=private_key_pem, password=None, backend=default_backend())
        self._server_public_keys = list()
        for path in servers_public_keys_paths:
            server_public_key_pem = self._get_pem_from_file(path)
            server_public_key = load_pem_public_key(data=server_public_key_pem, backend=default_backend())
            self._server_public_keys.append(server_public_key)

    def get_servers_public_key(self, id: int):
        return self._server_public_keys[id]

    def _get_pem_from_file(self, path: str) -> bytes:
        with open(path, 'rb') as pem_file:
            return pem_file.read()

    def check_signature(self, signature: bytearray, signed_data: bytearray, sender_public_key: rsa.RSAPublicKey) -> bool:
        try:
            sender_public_key.verify(bytes(signature),
                                     bytes(signed_data),
                                     padding.PSS(padding.MGF1(hashes.SHA256()), 0),  # Padding length?
                                     hashes.SHA256()
                                     )
        except InvalidSignature:
            return False
        else:
            return True

    def create_signature(self, data_to_sign: bytearray) -> bytearray:
        return self._regulator_private_key.sign(bytes(data_to_sign),
                                                padding.PSS(padding.MGF1(hashes.SHA256()), 0),  # Padding length?
                                                hashes.SHA256()
                                                )

    def encrypt_data(self, data: bytearray, receiver_public_key: rsa.RSAPublicKey) -> bytearray:
        encrypted_data = bytearray()
        while True:
            if len(data) - 100 > 0:
                bytes_data = receiver_public_key.encrypt(bytes(data[:100]), padding.OAEP(padding.MGF1(hashes.SHA256()), hashes.SHA256(), None))
                data = data[100:]
            else:
                bytes_data = receiver_public_key.encrypt(bytes(data), padding.OAEP(padding.MGF1(hashes.SHA256()), hashes.SHA256(), None))
            encrypted_data.extend(bytes_data)
        return encrypted_data

    def decrypt_data(self, data: bytearray) -> bytearray:
        decrypted_data = bytearray()
        while True:
            if len(data) - 100 > 0:
                bytes_data = self._regulator_private_key.decrypt(bytes(data[:100]), padding.OAEP(padding.MGF1(hashes.SHA256()), hashes.SHA256(), None))
                data = data[100:]
            else:
                bytes_data = self._regulator_private_key.decrypt(bytes(data), padding.OAEP(padding.MGF1(hashes.SHA256()), hashes.SHA256(), None))
            decrypted_data.extend(bytes_data)
        return decrypted_data