import { Form } from 'antd';
import { FormInstance } from 'antd/es/form';
import { RegulatorModel } from '../models/regulator-device-model/RegulatorDeviceModel';
import { encodeInBase64 } from '../utils/form/PublicKeyUtils';
import { ALL_REGULATORS_QUERY } from '../all-devices-list/devices-list/useDevicesQuery';
import {
  addNewRegulator,
  editRegulatorWithId,
  NewRegulatorRequestDTO,
} from '../rest-client/devices/RegulatorsRestClient';
import { useDeviceMutation } from '../utils/form/useDeviceMutation';

export enum NewRegulatorFieldNames {
  name = 'name',
  type = 'type',
  publicKey = 'publicKey',
  address = 'address',
  port = 'port',
}

function createInitialValues(regulator?: RegulatorModel): Record<NewRegulatorFieldNames, any> {
  return {
    name: regulator?.name,
    type: regulator?.type,
    address: regulator?.address || 'localhost',
    port: regulator?.port,
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

    const { name, type, publicKey, address, port } = values;

    await sendRegulator({
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
