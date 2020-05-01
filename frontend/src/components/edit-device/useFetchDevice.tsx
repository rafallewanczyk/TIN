import { queryCache, useQuery } from 'react-query';
import { DeviceModel } from '../models/regulator-device-model/RegulatorDeviceModel';
import { ALL_DEVICES_QUERY } from '../all-devices-list/devices-list/useDevicesQuery';
import { fetchDevices } from '../rest-client/devices/DevicesRestClient';

const getDeviceById = (devices: DeviceModel[], id: string | undefined): DeviceModel | undefined =>
  devices?.find((d) => d.id === id);

const getCachedDevices = (): DeviceModel[] | undefined =>
  queryCache.getQueryData(ALL_DEVICES_QUERY) as DeviceModel[] | undefined;

export const useFetchDevice = (id: string | undefined): DeviceModel | undefined => {
  const { data } = useQuery(!getCachedDevices() && ALL_DEVICES_QUERY, fetchDevices, {
    suspense: true,
  });
  const cachedData = getCachedDevices();

  return getDeviceById(cachedData || data || [], id);
};
