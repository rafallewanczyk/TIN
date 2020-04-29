import { Form } from 'antd';
import { FormInstance } from 'antd/es/form';
import { RegulatorModel } from '../models/regulator-device-model/RegulatorDeviceModel';

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
} = (regulator) => {
  const [form] = Form.useForm();
  const initialValues = regulator && createInitialValues(regulator);

  const onAddSubmit = async () => {
    try {
      const values = await form.validateFields();

      console.log('adding', values);
    } catch {
      console.log('Form.getFieldsValue()', form.getFieldsValue());
      console.log('Form.getFieldsError', form.getFieldsError());
    }
  };
  const onEditSubmit = async () => {
    try {
      const values = await form.validateFields();

      console.log('editing', values);
    } catch {
      console.log('Form.getFieldsValue()', form.getFieldsValue());
      console.log('Form.getFieldsError', form.getFieldsError());
    }
  };

  return {
    onSubmit: regulator ? onEditSubmit : onAddSubmit,
    form,
    initialValues,
  };
};
