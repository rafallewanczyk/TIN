import produce from 'immer';
import { queryCache } from 'react-query';
import {
  DeviceModel,
  LightDeviceModel,
  TemperatureDeviceModel,
} from '../../../models/regulator-device-model/RegulatorDeviceModel';
import { ALL_DEVICES_QUERY } from '../useDevicesQuery';

export const withModifiedDevice = (
  devices: DeviceModel[],
  deviceId: string,
  targetData: number | boolean,
): DeviceModel[] => {
  const modifyDevice = (device: DeviceModel) =>
    produce(device, (newDevice) => {
      (newDevice as TemperatureDeviceModel | LightDeviceModel).targetData = targetData;
    });

  return devices.map((it) => (it.id !== deviceId ? it : modifyDevice(it)));
};

export const updateCachedDeviceTargetData = (deviceId: string, targetData: number | boolean) => {
  queryCache.setQueryData(ALL_DEVICES_QUERY, (devices: DeviceModel[]) =>
    withModifiedDevice(devices, deviceId, targetData),
  );
};
