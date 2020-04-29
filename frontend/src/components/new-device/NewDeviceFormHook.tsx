import { Form } from 'antd';
import { useState } from 'react';
import { UploadChangeParam } from 'antd/es/upload';
import { FormInstance } from 'antd/es/form';
import {
  DeviceType,
  RegulatorModel,
  Status,
} from '../models/regulator-device-model/RegulatorDeviceModel';

export enum NewDeviceFieldNames {
  name = 'name',
  regulator = 'regulator',
  publicKey = 'publicKey',
}

export const useNewDeviceForm: () => {
  form: FormInstance;
  onSubmit: () => Promise<void>;
  regulators: RegulatorModel[];
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

  const regulators: RegulatorModel[] = [
    {
      name: 'Regulator 1',
      id: '11',
      status: Status.ACTIVE,
      type: DeviceType.TEMPERATURE,
    },
    {
      name: 'Regulator 3',
      id: '12',
      status: Status.INACTIVE,
      type: DeviceType.LIGHT,
    },
  ];

  return {
    form,
    onSubmit,
    regulators,
  };
};
