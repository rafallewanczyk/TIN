import React, { ReactNode, useState } from 'react';
import { Button, Form, Input, Select, Switch } from 'antd';
import { FormItemProps } from 'antd/es/form';
import { RouteComponentProps } from '@reach/router';
import Title from 'antd/es/typography/Title';
import Text from 'antd/es/typography/Text';
import { EditOutlined } from '@ant-design/icons/lib';
import style from './NewDevice.module.css';
import { PublicKeyUploader } from '../utils/form/PublicKeyUploader';
import { NewDeviceFieldNames, useNewDeviceForm } from './NewDeviceFormHook';
import { DeviceModel, RegulatorModel } from '../models/regulator-device-model/RegulatorDeviceModel';

export interface NewDeviceProps extends RouteComponentProps {
  device?: DeviceModel;
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

export const NewDeviceForm: React.FC<NewDeviceProps> = ({ device }) => {
  const { form, onSubmit, regulators, initialValues } = useNewDeviceForm(device);
  const editMode = !!device;
  const [keyUploaderVisible, setKeyUploaderVisible] = useState(!editMode);
  const submitButtonTitle = device ? 'Edit device' : 'Add device';

  const renderRegulatorOption = (regulator: RegulatorModel): ReactNode => (
    <Option key={regulator.id} value={regulator.id}>
      {regulator.name} [type: {regulator.type}]
    </Option>
  );

  const renderTitle = (): ReactNode => {
    const titleText = editMode ? `Edit device with id: ${device!.id}` : 'Add new device';

    return <Title level={1}>{titleText}</Title>;
  };

  const renderKeyUploaderToggle = (): ReactNode => (
    <div className={style.switchWrapper}>
      <Switch onClick={(toggleOn) => setKeyUploaderVisible(toggleOn)} />
      <Text className={style.switchText}>Would you like to change public key?</Text>
    </div>
  );

  return (
    <div className={style.wrapper}>
      {renderTitle()}
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
        {editMode && renderKeyUploaderToggle()}
        {keyUploaderVisible && <PublicKeyUploader fieldItemProps={fields.publicKey} form={form} />}
        <Form.Item className={style.submitButton}>
          <Button icon={<EditOutlined />} type="primary" onClick={onSubmit}>
            {submitButtonTitle}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
