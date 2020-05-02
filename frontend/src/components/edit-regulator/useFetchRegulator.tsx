import { queryCache, useQuery } from 'react-query';
import { RegulatorModel } from '../models/regulator-device-model/RegulatorDeviceModel';
import { ALL_REGULATORS_QUERY } from '../all-devices-list/devices-list/useDevicesQuery';
import { fetchRegulators } from '../rest-client/devices/RegulatorsRestClient';

const getRegulatorById = (
  devices: RegulatorModel[],
  id: string | undefined,
): RegulatorModel | undefined => devices?.find((d) => d.id === id);

const getCachedRegulators = (): RegulatorModel[] | undefined =>
  queryCache.getQueryData(ALL_REGULATORS_QUERY) as RegulatorModel[] | undefined;

export const useFetchRegulator = (id: string | undefined): RegulatorModel | undefined => {
  const { data } = useQuery(!getCachedRegulators() && ALL_REGULATORS_QUERY, fetchRegulators, {
    suspense: true,
  });

  const cachedData = getCachedRegulators();

  return getRegulatorById(cachedData || data || [], id);
};
