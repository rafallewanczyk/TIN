import React, { ReactNode } from 'react';
import { Button, Form, Input, Select } from 'antd';
import { FormItemProps } from 'antd/es/form';
import { RouteComponentProps } from '@reach/router';
import EditOutlined from '@ant-design/icons/EditOutlined';
import style from './NewDevice.module.css';
import { PublicKeyUploader } from '../utils/form/PublicKeyUploader';
import { NewDeviceFieldNames, useNewDeviceForm } from './NewDeviceFormHook';
import { DeviceModel, RegulatorModel } from '../models/regulator-device-model/RegulatorDeviceModel';
import { FormTitle } from '../utils/form/FormTitle';
import { OptionalKeyUploader } from '../utils/form/OptionalKeyUploader';

export interface NewDeviceProps extends RouteComponentProps {
  device?: DeviceModel;
  editMode?: boolean;
}

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

export const NewDeviceForm: React.FC<NewDeviceProps> = ({ device, editMode = false }) => {
  const { form, onSubmit, regulators, initialValues } = useNewDeviceForm(device);
  const submitButtonTitle = editMode ? 'Edit device' : 'Add device';

  const renderRegulatorOption = (regulator: RegulatorModel): ReactNode => (
    <Option key={regulator.id} value={regulator.id}>
      {regulator.name} [type: {regulator.type}]
    </Option>
  );

  return (
    <div className={style.wrapper}>
      <FormTitle deleteButtonVisible={editMode} id={device?.id} titleSubject="device" />
      <Form
        className={style.form}
        form={form}
        initialValues={initialValues}
        layout="vertical"
        size="middle"
      >
        <Form.Item {...fields.name}>
          <Input autoComplete="off" />
        </Form.Item>
        <Form.Item {...fields.regulator}>
          <Select>{regulators.map(renderRegulatorOption)}</Select>
        </Form.Item>
        {editMode ? (
          <OptionalKeyUploader form={form} formProps={fields.publicKey} />
        ) : (
          <PublicKeyUploader fieldItemProps={fields.publicKey} form={form} />
        )}
        <Form.Item className={style.submitButton}>
          <Button icon={<EditOutlined />} type="primary" onClick={onSubmit}>
            {submitButtonTitle}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
