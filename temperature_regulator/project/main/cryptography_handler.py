from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.serialization import load_der_private_key, load_der_public_key
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import hashes
from cryptography.exceptions import InvalidSignature
from typing import List
from cryptography.hazmat.primitives import serialization


class CryptographyHandler:
    def __init__(self, private_key_path: str, servers_public_keys_paths: List[str]):
        try:
            private_key_data = self._get_der_from_file(private_key_path)
        except IOError:
            self._regulator_private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048, backend=default_backend())
            public_key = self._regulator_private_key.public_key()
            key = self._regulator_private_key.private_bytes(encoding=serialization.Encoding.DER, format=serialization.PrivateFormat.PKCS8, encryption_algorithm=serialization.NoEncryption())
            self._save_key(key, private_key_path)
            key = public_key.public_bytes(encoding=serialization.Encoding.DER, format=serialization.PublicFormat.PKCS1)
            self._save_key(key, "Wygenerowany_klucz_publiczny.public")
        else:
            self._regulator_private_key = load_der_private_key(private_key_data, None, default_backend())
        self._server_public_keys = list()
        for path in servers_public_keys_paths:
            server_public_key_der = self._get_der_from_file(path)
            server_public_key = load_der_public_key(data=server_public_key_der, backend=default_backend())
            self._server_public_keys.append(server_public_key)

    def get_servers_public_key(self, id: int):
        return self._server_public_keys[id]

    def _get_der_from_file(self, path: str) -> bytes:
        with open(path, 'rb') as file:
            return file.read()
    
    def _save_key(self, key, file_name):
        with open(file_name, "wb+") as file:
            file.write(key)

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
            if len(data) - 150 > 0:
                bytes_data = receiver_public_key.encrypt(bytes(data[:150]), padding.OAEP(padding.MGF1(hashes.SHA256()), hashes.SHA256(), None))
                encrypted_data.extend(bytes_data)
                data = data[150:]
            else:
                bytes_data = receiver_public_key.encrypt(bytes(data), padding.OAEP(padding.MGF1(hashes.SHA256()), hashes.SHA256(), None))
                encrypted_data.extend(bytes_data)
                break
        return encrypted_data

    def decrypt_data(self, data: bytearray) -> bytearray:
        decrypted_data = bytearray()
        while True:
            if len(data) - 256 > 0:
                bytes_data = self._regulator_private_key.decrypt(bytes(data[:256]), padding.OAEP(padding.MGF1(hashes.SHA256()), hashes.SHA256(), None))
                decrypted_data.extend(bytes_data)
                data = data[256:]
            else:
                bytes_data = self._regulator_private_key.decrypt(bytes(data), padding.OAEP(padding.MGF1(hashes.SHA256()), hashes.SHA256(), None))
                decrypted_data.extend(bytes_data)
                break
        return decrypted_data
