from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.serialization import load_pem_private_key, load_pem_public_key
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import hashes
from cryptography.exceptions import InvalidSignature


class CryptographyHandler:
    def __init__(self, private_key_path: str, public_key_path: str):
        private_key_pem = self._get_pem_from_file(private_key_path)
        public_key_pem = self._get_pem_from_file(public_key_path)
        self._regulator_private_key = load_pem_private_key(data=private_key_pem, password=None, backend=default_backend())
        self._regulator_public_key = load_pem_public_key(public_key_pem, default_backend())

    def _get_pem_from_file(path: str) -> bytes:
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
        bytes_data = receiver_public_key.encrypt(bytes(data), padding.OAEP(padding.MGF1(hashes.SHA256()), hashes.SHA256(), None))
        return bytearray(bytes_data)

    def decrypt_data(self, data: bytearray) -> bytearray:
        bytes_data = self._regulator_private_key.decrypt(bytes(data), padding.OAEP(padding.MGF1(hashes.SHA256()), hashes.SHA256(), None))
        return bytearray(bytes_data)