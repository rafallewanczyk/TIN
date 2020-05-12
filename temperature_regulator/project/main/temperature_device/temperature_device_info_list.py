from temperature_device_info import TemperatureDeviceInfo
from readerwriterlock import rwlock
from typing import Tuple, Dict


class TemperatureDeviceInfoList:
    def __init__(self):
        self._devices = dict()
        self._lock = rwlock.RWLockWrite

    def add_device_or_overwrite(self, id: int, public_key: str, address: str, temperature: float):
        device = TemperatureDeviceInfo(id, public_key, address, temperature)
        with self._lock.gen_wlock():
            self._devices[id] = device
    
    def get_devices_temperature(self, id: int) -> float:
        with self._lock.gen_rlock():
            try:
                device = self._devices[id]
            except KeyError:
                return None
            temperature = device.temperature
        return temperature

    def set_devices_temperature(self, id: int, temperature: float) -> bool:
        with self._lock.gen_wlock():
            try:
                device = self._devices[id]
            except KeyError:
                return False
            device.temperature = temperature
        return True

    def get_devices_information(self, id: int) -> float:
        with self._lock.get_rlock():
            device = self._devices[id]
            infos = (device.public_key, device.address, device.temperature)
        return infos
    
    def get_devices_address(self, id: int) -> Tuple[str, int]:
        with self._lock.get_rlock():
            try:
                device = self._devices[id]
            except KeyError:
                return None
            address = device.address
        return address

    def get_all_devices_info(self) -> Dict[int, TemperatureDeviceInfo]:
        with self._lock.get_rlock():
            return self._devices.copy()
