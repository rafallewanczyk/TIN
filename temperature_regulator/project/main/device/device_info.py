from typing import Tuple


class DeviceInfo:

    def __init__(self, id: int, public_key: str, address: Tuple[str, int], temperature: float):
        self._id = id
        self._public_key = public_key
        self._address = address
        self._temperature = temperature
    
    @property
    def id(self) -> int:
        return self._id
    
    @property
    def public_key(self) -> str:
        return self._public_key

    @property
    def address(self) -> Tuple[str, int]:
        return self._address
    
    @property
    def temperature(self) -> float:
        return self._temperature

    @temperature.setter
    def temperature(self, temperature: str):
        self._temperature = temperature
    
    @address.setter
    def address(self, address: Tuple[str, int]):
        self._address = address

    @public_key.setter
    def public_key(self, public_key: str):
        self._public_key = public_key