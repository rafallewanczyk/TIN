import { Form } from 'antd';
import { FormInstance } from 'antd/es/form';

export enum NewRegulatorFieldNames {
  name = 'name',
  type = 'type',
  publicKey = 'publicKey',
}

export const useNewDeviceForm: () => {
  onSubmit: () => Promise<void>;
  form: FormInstance;
} = () => {
  const [form] = Form.useForm();
  const onSubmit = async () => {
    try {
      const values = await form.validateFields();

      console.log(values);
    } catch {
      console.log('Form.getFieldsValue()', form.getFieldsValue());
      console.log('Form.getFieldsError', form.getFieldsError());
    }
  };

  return {
    onSubmit,
    form,
  };
};
