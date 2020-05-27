import { Form } from 'antd';
import { FormInstance } from 'antd/es/form';
import {
  DeviceModel,
  DeviceType,
  RegulatorModel,
} from '../models/regulator-device-model/RegulatorDeviceModel';
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
  id = 'id',
  name = 'name',
  regulatorId = 'regulatorId',
  publicKey = 'publicKey',
  address = 'address',
  port = 'port',
}

function createInitialValues(
  device?: DeviceModel,
  regulators: RegulatorModel[] = [],
): Record<NewDeviceFieldNames, any> {
  return {
    id: device?.id ?? Math.floor(Math.random() * 10000),
    name: device?.name,
    regulatorId: regulators.some((it) => it.id === device?.regulatorId)
      ? device?.regulatorId
      : undefined,
    publicKey: undefined,
    address: device?.address || 'localhost',
    port: device?.port,
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
  const initialValues = createInitialValues(device, regulators);

  const onSubmit = async () => {
    let values: Record<string, any>;
    try {
      values = await form.validateFields();

      console.log('Values', values);
    } catch {
      return;
    }

    const { id, name, regulatorId, address, port, publicKey } = values;
    const deviceType =
      regulators?.find((it) => it.id === regulatorId)?.type ?? DeviceType.TEMPERATURE;

    await sendDevice({
      id,
      name,
      regulatorId,
      address,
      port,
      type: deviceType,
      publicKey: publicKey && (await encodeInBase64(publicKey)),
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
