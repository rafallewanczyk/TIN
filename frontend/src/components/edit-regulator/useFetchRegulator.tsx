import { queryCache, useQuery } from 'react-query';
import { useNavigate } from '@reach/router';
import { RegulatorModel } from '../models/regulator-device-model/RegulatorDeviceModel';
import { ALL_REGULATORS_QUERY } from '../all-devices-list/devices-list/useDevicesQuery';
import { fetchRegulators } from '../rest-client/devices/RegulatorsRestClient';
import { sendServerError } from '../utils/error/errors';

const getRegulatorById = (
  devices: RegulatorModel[],
  id: number | undefined,
): RegulatorModel | undefined => devices?.find((d) => d.id === id);

const getCachedRegulators = (): RegulatorModel[] | undefined =>
  queryCache.getQueryData(ALL_REGULATORS_QUERY) as RegulatorModel[] | undefined;

export const useFetchRegulator = (id: number | undefined): RegulatorModel | undefined => {
  const navigate = useNavigate();

  const { data } = useQuery(!getCachedRegulators() && ALL_REGULATORS_QUERY, fetchRegulators, {
    suspense: true,
    onError: (e: unknown) => {
      sendServerError(e);
      navigate('/');
    },
  });

  const cachedData = getCachedRegulators();

  return getRegulatorById(cachedData || data || [], id);
};
