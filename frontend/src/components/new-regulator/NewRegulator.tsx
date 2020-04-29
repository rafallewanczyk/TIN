import React, { ReactNode } from 'react';
import { RouteComponentProps } from '@reach/router';
import { Button, Form, Input, Select } from 'antd';
import { FormItemProps } from 'antd/es/form';
import style from './NewRegulator.module.css';
import { PublicKeyUploader } from '../utils/form/PublicKeyUploader';
import { NewRegulatorFieldNames, useNewDeviceForm } from './NewRegulatorFormHook';
import { DeviceType } from '../models/regulator-device-model/RegulatorDeviceModel';
import { capitalize } from '../utils/string/stringUtils';

export type NewDeviceProps = RouteComponentProps;

const { Option } = Select;

const fields: Record<NewRegulatorFieldNames, Omit<FormItemProps, 'children'>> = {
  [NewRegulatorFieldNames.name]: {
    rules: [{ required: true, message: 'Please give regulator name' }],
    name: NewRegulatorFieldNames.name,
    label: 'Regulator name: ',
  },
  [NewRegulatorFieldNames.type]: {
    rules: [{ required: true, message: 'Please choose regulator type' }],
    name: NewRegulatorFieldNames.type,
    label: 'Choose your regulator type: ',
  },
  [NewRegulatorFieldNames.publicKey]: {
    rules: [{ required: true, message: "Please give a regulator's public key" }],
    name: NewRegulatorFieldNames.publicKey,
    label: "Regulators's public key: ",
  },
};

export const NewRegulator: React.FC<NewDeviceProps> = (props) => {
  const { form, onSubmit } = useNewDeviceForm();

  const renderDeviceTypeOption = (type: DeviceType): ReactNode => (
    <Option key={type} value={type}>
      {capitalize(type)}
    </Option>
  );

  return (
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
      <Form.Item {...fields.type}>
        <Select>
          {renderDeviceTypeOption(DeviceType.LIGHT)}
          {renderDeviceTypeOption(DeviceType.TEMPERATURE)}
        </Select>
      </Form.Item>
      <PublicKeyUploader fieldItemProps={fields.publicKey} form={form} />
      <Form.Item className={style.submitButton}>
        <Button onClick={onSubmit}>Add regulator</Button>
      </Form.Item>
    </Form>
  );
};
