import React, { ReactNode } from 'react';
import { RouteComponentProps } from '@reach/router';
import { Button, Form, Input, Select } from 'antd';
import { FormItemProps } from 'antd/es/form';
import style from './NewDevice.module.css';
import { PublicKeyUploader } from '../utils/form/PublicKeyUploader';
import { NewDeviceFieldNames, useNewDeviceForm } from './NewDeviceFormHook';
import { RegulatorModel } from '../models/regulator-device-model/RegulatorDeviceModel';

export type NewDeviceProps = RouteComponentProps;

const { Option } = Select;

const fields: Record<NewDeviceFieldNames, Omit<FormItemProps, 'children'>> = {
  [NewDeviceFieldNames.name]: {
    rules: [{ required: true, message: 'Please give device name' }],
    name: NewDeviceFieldNames.name,
    label: 'Device name: ',
  },
  [NewDeviceFieldNames.regulator]: {
    rules: [{ required: true, message: 'Please choose regulator' }],
    name: NewDeviceFieldNames.regulator,
    label: 'Choose your regulator',
  },
  [NewDeviceFieldNames.publicKey]: {
    rules: [{ required: true, message: "Please give a device's public key" }],
    name: NewDeviceFieldNames.publicKey,
    label: "Device's public key: ",
  },
};

export const NewDevice: React.FC<NewDeviceProps> = (props) => {
  const { form, onSubmit, regulators } = useNewDeviceForm();

  const renderRegulatorOption = (regulator: RegulatorModel): ReactNode => (
    <Option key={regulator.id} value={regulator.id}>
      {regulator.name} [type: {regulator.type}]
    </Option>
  );

  return (
    <div>
      <Form
        form={form}
        labelCol={{ span: 10 }}
        layout="vertical"
        size="large"
        wrapperCol={{ span: 10 }}
      >
        <Form.Item {...fields.name}>
          <Input autoComplete="off" />
        </Form.Item>
        <Form.Item {...fields.regulator}>
          <Select>{regulators.map(renderRegulatorOption)}</Select>
        </Form.Item>
        <PublicKeyUploader fieldItemProps={fields.publicKey} form={form} />
        <Form.Item className={style.submitButton}>
          <Button onClick={onSubmit}>Add device</Button>
        </Form.Item>
      </Form>
    </div>
  );
};
