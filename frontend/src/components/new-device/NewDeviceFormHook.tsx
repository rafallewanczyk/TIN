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
  uploadButtonDisabled: boolean;
  onUploadStateChange: ({ fileList }: UploadChangeParam) => void;
  form: FormInstance;
  onSubmit: () => Promise<void>;
  isPublicKeyValid: () => boolean;
  regulators: RegulatorModel[];
} = () => {
  const [form] = Form.useForm();
  const [uploadButtonDisabled, setUploadButtonDisabled] = useState(false);

  const onUploadStateChange = ({ fileList }: UploadChangeParam): void => {
    setUploadButtonDisabled(fileList.length >= 1);
  };

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();

      console.log(values);
    } catch {
      console.log('Form.getFieldsValue()', form.getFieldsValue());
      console.log('Form.getFieldsError', form.getFieldsError());
    }
  };

  const isPublicKeyValid = (): boolean => {
    const keyValue = form.getFieldValue(NewDeviceFieldNames.publicKey);
    const keyErrors = form.getFieldError(NewDeviceFieldNames.publicKey);

    return keyValue && keyErrors.length === 0;
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
    uploadButtonDisabled,
    onUploadStateChange,
    onSubmit,
    isPublicKeyValid,
    regulators,
  };
};
