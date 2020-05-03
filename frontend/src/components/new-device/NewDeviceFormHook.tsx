import { Form } from 'antd';
import { FormInstance } from 'antd/es/form';
import { DeviceModel, RegulatorModel } from '../models/regulator-device-model/RegulatorDeviceModel';
import {
  ALL_DEVICES_QUERY,
  useAllRegulatorsQuery,
} from '../all-devices-list/devices-list/useDevicesQuery';
import { encodeInBase64 } from '../utils/form/PublicKeyUtils';
import { useDeviceMutation } from '../utils/form/useDeviceMutation';
import {
  addNewDevice,
  editDeviceWithId,
  NewDeviceRequestDTO,
} from '../rest-client/devices/DevicesRestClient';

export enum NewDeviceFieldNames {
  name = 'name',
  regulatorId = 'regulatorId',
  publicKey = 'publicKey',
}

function createInitialValues(device?: DeviceModel): Record<NewDeviceFieldNames, any> {
  return {
    name: device?.name,
    regulatorId: device?.regulatorId,
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
  const { data: regulators } = useAllRegulatorsQuery({ suspense: true });
  const [sendDevice, { status }] = useDeviceMutation<NewDeviceRequestDTO>({
    deviceId: device?.id || null,
    queryToReset: ALL_DEVICES_QUERY,
    addMutation: addNewDevice,
    editMutation: editDeviceWithId,
  });
  const initialValues = device && createInitialValues(device);

  const onSubmit = async () => {
    let values: Record<string, any>;
    try {
      values = await form.validateFields();

      console.log('Values', values);
    } catch {
      return;
    }

    await sendDevice({
      name: values.name,
      regulatorId: values.regulatorId,
      publicKey: values.publicKey && (await encodeInBase64(values.publicKey)),
    });
  };

  return {
    form,
    onSubmit,
    regulators: regulators || [],
    initialValues,
    loading: status === 'loading',
  };
};
