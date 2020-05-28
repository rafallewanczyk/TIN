import { Form } from 'antd';
import { FormInstance } from 'antd/es/form';
import { DeviceType, RegulatorModel } from '../models/regulator-device-model/RegulatorDeviceModel';
import { encodeInBase64 } from '../utils/form/PublicKeyUtils';
import { ALL_REGULATORS_QUERY } from '../all-devices-list/devices-list/useDevicesQuery';
import {
  addNewRegulator,
  editRegulatorWithId,
  NewRegulatorRequestDTO,
} from '../rest-client/devices/RegulatorsRestClient';
import { useDeviceMutation } from '../utils/form/useDeviceMutation';

export enum NewRegulatorFieldNames {
  id = 'id',
  name = 'name',
  type = 'type',
  publicKey = 'publicKey',
  address = 'address',
  port = 'port',
}

function createInitialValues(regulator?: RegulatorModel): Record<NewRegulatorFieldNames, any> {
  return {
    id: regulator?.id ?? Math.floor(Math.random() * 10000),
    name: regulator?.name ?? 'Test name 1',
    type: regulator?.type ?? DeviceType.TEMPERATURE,
    address: regulator?.address || 'localhost',
    port: regulator?.port ?? 11000,
    publicKey: undefined,
  };
}

export const useNewRegulatorForm: (
  regulator?: RegulatorModel,
) => {
  onSubmit: () => Promise<void>;
  form: FormInstance;
  initialValues?: Record<NewRegulatorFieldNames, any>;
  loading: boolean;
} = (regulator) => {
  const [form] = Form.useForm();
  const initialValues = createInitialValues(regulator);
  const [sendRegulator, { status }] = useDeviceMutation<NewRegulatorRequestDTO>({
    deviceId: regulator?.id || null,
    queryToReset: ALL_REGULATORS_QUERY,
    addMutation: addNewRegulator,
    editMutation: editRegulatorWithId,
  });

  const onSubmit = async () => {
    let values: Record<string, any> = {};
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    const { id, name, type, publicKey, address, port } = values;

    await sendRegulator({
      id,
      name,
      type,
      address,
      port,
      publicKey: publicKey && (await encodeInBase64(publicKey)),
    });
  };

  return {
    onSubmit,
    form,
    initialValues,
    loading: status === 'loading',
  };
};
