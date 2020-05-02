import { Form } from 'antd';
import { FormInstance } from 'antd/es/form';
import { queryCache, useMutation } from 'react-query';
import { useNavigate } from '@reach/router';
import {
  DeviceModel,
  DeviceType,
  RegulatorModel,
  Status,
} from '../models/regulator-device-model/RegulatorDeviceModel';
import { addNewDevice, editDeviceWithId } from '../rest-client/devices/DevicesRestClient';
import { ALL_DEVICES_QUERY } from '../all-devices-list/devices-list/useDevicesQuery';
import { encodeInBase64 } from '../utils/form/PublicKeyUtils';

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
  const initialValues = device && createInitialValues(device);
  const [sendDevice, { status }] = useMutation(
    device ? editDeviceWithId(device.id) : addNewDevice,
    {
      onSuccess: () => {
        queryCache.removeQueries(ALL_DEVICES_QUERY);
        navigate('/');
      },
    },
  );

  const onSubmit = async () => {
    let values: Record<string, any> = {};
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    console.log('Values', values);

    await sendDevice({
      name: values.name,
      regulatorId: values.regulatorId,
      publicKey: values.publicKey && (await encodeInBase64(values.publicKey)),
    });
  };

  const regulators: RegulatorModel[] = [
    {
      name: 'Regulator 1',
      id: '11',
      status: Status.ACTIVE,
      type: DeviceType.TEMPERATURE,
    },
    {
      name: 'Regulator 3',
      id: '14',
      status: Status.INACTIVE,
      type: DeviceType.LIGHT,
    },
  ];

  return {
    form,
    onSubmit,
    regulators,
    initialValues,
    loading: status === 'loading',
  };
};
