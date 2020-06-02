import { DeviceType } from '../models/regulator-device-model/RegulatorDeviceModel';

export const renderDeviceType = (deviceType: DeviceType): string => {
  switch (deviceType) {
    case DeviceType.LIGHT:
      return 'Light';
    case DeviceType.TEMPERATURE:
      return 'Temperature';
    default:
      return 'Device type not recognised';
  }
};
