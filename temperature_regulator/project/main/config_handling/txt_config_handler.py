from .config_handler import ConfigHandler
from typing import Union, TextIO


class TxtConfigHandler(ConfigHandler):

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
                if value.find(',') != -1:
                    values = value.split(',')
                    for id, value in enumerate(values):
                        values[id] = value.strip()
                    value = values
                else:
                    value = value.strip()
                data[key] = value
        return data
