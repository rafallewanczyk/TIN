// const [data, setData] = useState<any>([]);
import { useQuery } from 'react-query';
import { DeviceModel } from '../../models/regulator-device-model/RegulatorDeviceModel';
import { fetchDevices } from '../../rest-client/devices/DevicesRestClient';

export const ALL_DEVICES_QUERY = 'devicesList';
const REFETCH_INTERVAL = 10000;

export const useDevicesQuery = (): [DeviceModel[] | undefined, boolean] => {
  const { data, status } = useQuery(ALL_DEVICES_QUERY, fetchDevices, {
    refetchOnWindowFocus: false,
    refetchInterval: REFETCH_INTERVAL,
  });

  return [data, status === 'loading'];
};
