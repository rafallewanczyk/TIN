import { queryCache, useQuery } from 'react-query';
import { useNavigate } from '@reach/router';
import { DeviceModel } from '../models/regulator-device-model/RegulatorDeviceModel';
import { ALL_DEVICES_QUERY } from '../all-devices-list/devices-list/useDevicesQuery';
import { fetchDevices } from '../rest-client/devices/DevicesRestClient';
import { sendServerError } from '../utils/error/errors';

const getDeviceById = (devices: DeviceModel[], id: number | undefined): DeviceModel | undefined =>
  devices?.find((d) => d.id === id);

const getCachedDevices = (): DeviceModel[] | undefined =>
  queryCache.getQueryData(ALL_DEVICES_QUERY) as DeviceModel[] | undefined;

export const useFetchDevice = (id: number | undefined): DeviceModel | undefined => {
  const navigate = useNavigate();
  const { data } = useQuery(!getCachedDevices() && ALL_DEVICES_QUERY, fetchDevices, {
    // suspense: true,
    onError: (e: unknown) => {
      sendServerError(e);
      navigate('/');
    },
  });

  const cachedData = getCachedDevices();

  return getDeviceById(cachedData || data || [], id);
};
