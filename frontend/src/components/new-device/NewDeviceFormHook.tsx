import { Form } from 'antd';
import { FormInstance } from 'antd/es/form';
import {
  DeviceModel,
  DeviceType,
  RegulatorModel,
  Status,
} from '../models/regulator-device-model/RegulatorDeviceModel';

export enum NewDeviceFieldNames {
  name = 'name',
  regulator = 'regulator',
  publicKey = 'publicKey',
}

function createInitialValues(device: DeviceModel): Record<NewDeviceFieldNames, any> {
  return {
    name: device.name,
    regulator: device.regulatorId,
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
} = (device) => {
  const [form] = Form.useForm();
  const initialValues = device && createInitialValues(device);

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
    onSubmit: device ? onEditSubmit : onAddSubmit,
    regulators,
    initialValues,
  };
};
