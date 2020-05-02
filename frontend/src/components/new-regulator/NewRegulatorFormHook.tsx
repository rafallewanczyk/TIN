import { Form } from 'antd';
import { FormInstance } from 'antd/es/form';
import { queryCache, useMutation } from 'react-query';
import { useNavigate } from '@reach/router';
import { RegulatorModel } from '../models/regulator-device-model/RegulatorDeviceModel';
import { encodeInBase64 } from '../utils/form/PublicKeyUtils';
import { ALL_REGULATORS_QUERY, } from '../all-devices-list/devices-list/useDevicesQuery';
import { addNewRegulator, editRegulatorWithId } from '../rest-client/devices/RegulatorsRestClient';

export enum NewRegulatorFieldNames {
  name = 'name',
  type = 'type',
  publicKey = 'publicKey',
}

function createInitialValues(regulator: RegulatorModel): Record<NewRegulatorFieldNames, any> {
  return {
    name: regulator.name,
    publicKey: undefined,
    type: regulator.type,
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
  const navigate = useNavigate();
  const initialValues = regulator && createInitialValues(regulator);
  const [sendRegulator, { status }] = useMutation(
    regulator ? editRegulatorWithId(regulator.id) : addNewRegulator,
    {
      onSuccess: () => {
        queryCache.removeQueries(ALL_REGULATORS_QUERY);
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

    const { name, type, publicKey } = values;

    await sendRegulator({
      name,
      type,
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
