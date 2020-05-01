// const [data, setData] = useState<any>([]);
import axios from 'axios';
import { useQuery } from 'react-query';
import { DeviceModel } from '../../models/regulator-device-model/RegulatorDeviceModel';
import { fetchDevices } from '../../rest-client/devices/DevicesRestClient';

export const ALL_DEVICES_QUERY = 'devicesList';

export const useDevicesQuery = (): [DeviceModel[] | undefined, boolean] => {
  const { data, status } = useQuery(ALL_DEVICES_QUERY, fetchDevices, {
    refetchInterval: 2000,
  });

  return [data, status === 'loading'];
};
