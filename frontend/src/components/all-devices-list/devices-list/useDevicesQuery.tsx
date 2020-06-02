// const [data, setData] = useState<any>([]);
import { QueryOptions, useQuery } from 'react-query';
import {
  DeviceModel,
  RegulatorModel,
} from '../../models/regulator-device-model/RegulatorDeviceModel';
import { fetchDevices } from '../../rest-client/devices/DevicesRestClient';
import { fetchRegulators } from '../../rest-client/devices/RegulatorsRestClient';

export const ALL_DEVICES_QUERY = 'devicesList';
export const ALL_REGULATORS_QUERY = 'regulatorsList';
export const REFETCH_INTERVAL = 60000;

export const useDevicesQuery = (): [DeviceModel[] | undefined, boolean] => {
  const { data, status } = useQuery(ALL_DEVICES_QUERY, fetchDevices, {
    refetchOnWindowFocus: false,
    refetchInterval: REFETCH_INTERVAL,
    retry: false,
  });

  return [data, status === 'loading'];
};

export const useAllRegulatorsQuery = (
  options?: QueryOptions<RegulatorModel[]>,
  devicesLoading = false,
) => useQuery(!devicesLoading && ALL_REGULATORS_QUERY, fetchRegulators, options);

export const useRegulatorsQuery = (
  devicesLoading: boolean,
): [RegulatorModel[] | undefined, boolean] => {
  const { data, status } = useAllRegulatorsQuery(
    {
      refetchOnWindowFocus: false,
      refetchInterval: REFETCH_INTERVAL,
      retry: false,
    },
    devicesLoading,
  );

  return [data, status === 'loading'];
};
