import { Form } from 'antd';
import { FormInstance } from 'antd/es/form';
import { queryCache, useMutation, useQuery } from 'react-query';
import { useNavigate } from '@reach/router';
import { DeviceModel, RegulatorModel } from '../models/regulator-device-model/RegulatorDeviceModel';
import { addNewDevice, editDeviceWithId } from '../rest-client/devices/DevicesRestClient';
import {
  ALL_DEVICES_QUERY,
  ALL_REGULATORS_QUERY,
} from '../all-devices-list/devices-list/useDevicesQuery';
import { encodeInBase64 } from '../utils/form/PublicKeyUtils';
import { fetchRegulators } from '../rest-client/devices/RegulatorsRestClient';

export enum NewDeviceFieldNames {
  name = 'name',
  regulatorId = 'regulatorId',
  publicKey = 'publicKey',
}

function createInitialValues(device: DeviceModel): Record<NewDeviceFieldNames, any> {
  return {
    name: device.name,
    regulatorId: device.regulatorId,
    publicKey: undefined,
  };
}

export const useNewDeviceForm: (
  device?: DeviceModel,
) => {
  initialValues: undefined | Record<NewDeviceFieldNames, any>;
  form: FormInstance;
  onSubmit: () => Promise<void>;
  regulators: RegulatorModel[];
  loading: boolean;
} = (device) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { data: regulators } = useQuery(ALL_REGULATORS_QUERY, fetchRegulators, {
    suspense: true,
  });
  const initialValues = device && createInitialValues(device);
  const [sendDevice, { status, error }] = useMutation(
    device ? editDeviceWithId(device.id) : addNewDevice,
    {
      onSuccess: () => {
        queryCache.removeQueries(ALL_DEVICES_QUERY);
        navigate('/');
      },
    },
  );
  console.log('Error', error);

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();

      console.log('Values', values);
      await sendDevice({
        name: values.name,
        regulatorId: values.regulatorId,
        publicKey: values.publicKey && (await encodeInBase64(values.publicKey)),
      });
    } catch {}
  };

  return {
    form,
    onSubmit,
    regulators: regulators || [],
    initialValues,
    loading: status === 'loading',
  };
};
