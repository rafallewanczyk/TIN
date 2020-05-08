from .config_loader import ConfigLoader
from typing import Union, TextIO


class TxtConfigLoader(ConfigLoader):

    def __init__(self, file: Union[str, TextIO]):
        if type(file) is str:
            with open(file, 'r') as file:
                data = self._load_configuration(file)
        else:
            data = self._load_configuration(file)
        super().__init__(data)

    def _load_configuration(self, file: TextIO):
        data = dict()
        lines = file.readlines()
        for line in lines:
            if(line.find(':') != -1):
                key, value = tuple(line.split('#', 1)[0].split(':', 1))
                key = key.strip()
                value = value.strip()
                data[key] = value
        return data
