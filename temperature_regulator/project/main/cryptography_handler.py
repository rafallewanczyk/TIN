from cryptography.hazmat.primitives.serialization import load_pem_private_key


class CryptographyHandler:
    def __init__(self, private_key_path: str, public_key_path: str):
        pass

    def check_signature(signature: bytearray, signed_data: bytearray, sender_public_key: str) -> bool:
        pass

    def create_signature(data_to_sign: bytearray, sender_private_key: str) -> bytearray:
        pass

    def encrypt_data(data: bytearray, receiver_public_key: str) -> bytearray:
        pass

    def decrypt_data(data: bytearray, receiver_private_key: str) -> bytearray:
        pass
