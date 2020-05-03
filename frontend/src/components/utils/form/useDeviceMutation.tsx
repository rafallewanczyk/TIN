import { MutationFunction, queryCache, useMutation } from 'react-query';
import { useNavigate } from '@reach/router';
import {
  ALL_DEVICES_QUERY,
  ALL_REGULATORS_QUERY,
} from '../../all-devices-list/devices-list/useDevicesQuery';
import { sendServerError } from '../error/errors';

interface UseDeviceMutationProps<AddRequest> {
  deviceId: string | null;
  queryToReset: typeof ALL_DEVICES_QUERY | typeof ALL_REGULATORS_QUERY;
  addMutation: MutationFunction<void, AddRequest>;
  editMutation(id: string): MutationFunction<void, AddRequest>;
}

export const useDeviceMutation = <AddRequest, >({
  deviceId,
  editMutation,
  addMutation,
  queryToReset,
}: UseDeviceMutationProps<AddRequest>) => {
  const navigate = useNavigate();
  const mutation = deviceId ? editMutation(deviceId) : addMutation;

  const onSuccess = (): void => {
    queryCache.removeQueries(queryToReset);
    navigate('/');
  };

  return useMutation(mutation, {
    onSuccess,
    onError: sendServerError,
  });
};
