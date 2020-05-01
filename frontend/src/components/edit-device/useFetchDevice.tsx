// const [data, setData] = useState<any>([]);
import axios from 'axios';
import { AnyQueryKey, queryCache, useQuery } from 'react-query';
import { DeviceModel } from '../models/regulator-device-model/RegulatorDeviceModel';
import { ALL_DEVICES_QUERY } from '../all-devices-list/devices-list/useDevicesQuery';
import { fetchDevices } from '../rest-client/devices/DevicesRestClient';

const getDeviceFromCache = (id: string | undefined): DeviceModel | undefined => {
  const devices = queryCache.getQueryData(ALL_DEVICES_QUERY) as DeviceModel[];

  return devices?.find((d) => d.id === id);
};

export const useFetchDevice = (id: string | undefined): DeviceModel | undefined => {
  const device = getDeviceFromCache(id);
  useQuery(!device && ALL_DEVICES_QUERY, fetchDevices, { suspense: true });

  console.log('single device', device);

  return device;
};
