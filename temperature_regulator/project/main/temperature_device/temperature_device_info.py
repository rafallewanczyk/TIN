

class TemperatureDeviceInfo:

    def __init__(self, id: int, public_key: str, address: str, parameters):
        self._id = id
        self._public_key = public_key
        self._address = address
        self._paramteters = parameters
    
    @property
    def id(self) -> int:
        return self._id
    
    @property
    def public_key(self) -> str:
        return self._public_key

    @property
    def address(self) -> str:
        return self._address
    
    @property
    def parameters(self):
        return self._parameters
