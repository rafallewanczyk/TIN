from cryptography.hazmat.primitives.serialization import load_pem_private_key


class CryptographyHandler:
    def __init__(self, keys_dir_path: str):
        pass

    def check_signature(signature: bytearray, signed_data: bytearray, id: int) -> bool:
        pass

    def create_signature(data_to_sign, id: int) -> bytearray:
        pass

    def encrypt_data(data) -> bytearray:
        pass
