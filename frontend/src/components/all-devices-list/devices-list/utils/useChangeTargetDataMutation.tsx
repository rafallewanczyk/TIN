import { queryCache, useMutation } from 'react-query';
import {
  LightDeviceModel,
  TemperatureDeviceModel,
} from '../../../models/regulator-device-model/RegulatorDeviceModel';
import * as deviceRestClient from '../../../rest-client/devices/DevicesRestClient';
import { ALL_DEVICES_QUERY } from '../useDevicesQuery';

export const useChangeTargetDataMutation: (
  device: TemperatureDeviceModel | LightDeviceModel,
) => [(value: number | boolean | undefined) => void, boolean] = (device) => {
  const [mutateTemperature, { status }] = useMutation(deviceRestClient.changeTargetData);

  const changeDeviceTargetValue = (value: number | boolean | undefined) => {
    if (value === undefined) return;

    console.log(value);

    return mutateTemperature(
      { id: device.id, targetData: value },
      {
        onSuccess: () => {
          queryCache.refetchQueries(ALL_DEVICES_QUERY);
        },
      },
    );
  };

  return [changeDeviceTargetValue, status === 'loading'];
};
