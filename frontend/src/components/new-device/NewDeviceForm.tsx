import React, { ReactNode, useState } from 'react';
import { Button, Form, Input, InputNumber, Select } from 'antd';
import { FormItemProps } from 'antd/es/form';
import { RouteComponentProps } from '@reach/router';
import EditOutlined from '@ant-design/icons/EditOutlined';
import style from './NewDevice.module.css';
import { PublicKeyUploader } from '../utils/form/PublicKeyUploader';
import { NewDeviceFieldNames, useNewDeviceForm } from './NewDeviceFormHook';
import { DeviceModel, RegulatorModel } from '../models/regulator-device-model/RegulatorDeviceModel';
import { FormTitle } from '../utils/form/FormTitle';
import { OptionalKeyUploader } from '../utils/form/OptionalKeyUploader';
import { FormSpinner } from '../new-regulator/FormSpinner';
import { renderDeviceType } from '../enum-renderers/deviceTypeRenderer';

export interface NewDeviceProps extends RouteComponentProps {
  device?: DeviceModel;
  editMode?: boolean;
}

const { Option } = Select;

const fields: Record<NewDeviceFieldNames, Omit<FormItemProps, 'children'>> = {
  [NewDeviceFieldNames.id]: {
    rules: [{ required: true, message: 'Please give device id' }],
    name: NewDeviceFieldNames.id,
    label: 'Device id: ',
  },
  [NewDeviceFieldNames.name]: {
    rules: [{ required: true, message: 'Please give device name' }],
    name: NewDeviceFieldNames.name,
    label: 'Device name: ',
  },
  [NewDeviceFieldNames.regulatorId]: {
    rules: [{ required: true, message: 'Please choose regulator' }],
    name: NewDeviceFieldNames.regulatorId,
    label: 'Choose your regulator',
  },
  [NewDeviceFieldNames.publicKey]: {
    rules: [{ required: true, message: "Please give a device's public key" }],
    name: NewDeviceFieldNames.publicKey,
    label: "Device's public key: ",
  },
  [NewDeviceFieldNames.address]: {
    rules: [{ required: true, message: "Please give a device's address ip:" }],
    name: NewDeviceFieldNames.address,
    label: "Device's address ip:",
  },
  [NewDeviceFieldNames.port]: {
    rules: [{ required: true, message: "Please give a device's port" }],
    name: NewDeviceFieldNames.port,
    label: "Device's port: ",
  },
};

export const NewDeviceForm: React.FC<NewDeviceProps> = ({ device, editMode = false }) => {
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const { form, onSubmit, regulators, initialValues, loading } = useNewDeviceForm(device);
  const fetchingInProgress = loading || deleteInProgress;
  const submitButtonTitle = editMode ? 'Edit device' : 'Add device';

  const renderRegulatorOption = (regulator: RegulatorModel): ReactNode => (
    <Option key={regulator.id} value={regulator.id}>
      {regulator.name} [type: {renderDeviceType(regulator.type)}]
    </Option>
  );

  return (
    <div className={style.wrapper}>
      <FormTitle
        deleteButtonDisabled={fetchingInProgress}
        deleteButtonVisible={editMode}
        id={device?.id}
        subject="device"
        onFetchingStateChange={setDeleteInProgress}
      />
      <Form
        className={style.form}
        form={form}
        initialValues={initialValues}
        layout="vertical"
        size="middle"
      >
        {fetchingInProgress && <FormSpinner />}
        <Form.Item {...fields.id}>
          <InputNumber
            disabled={editMode}
            parser={(value) => value?.replace('.', '') ?? ''}
            step={1}
          />
        </Form.Item>
        <Form.Item {...fields.name}>
          <Input autoComplete="off" />
        </Form.Item>
        <Form.Item {...fields.regulatorId}>
          <Select>{regulators.map(renderRegulatorOption)}</Select>
        </Form.Item>
        <Form.Item {...fields.address}>
          <Input autoComplete="off" />
        </Form.Item>
        <Form.Item {...fields.port}>
          <InputNumber max={65535} min={1024} />
        </Form.Item>
        {editMode ? (
          <OptionalKeyUploader form={form} formProps={fields.publicKey} />
        ) : (
          <PublicKeyUploader fieldItemProps={fields.publicKey} form={form} />
        )}
        <Form.Item className={style.submitButton}>
          <Button
            className="data-cy-submit-btn"
            disabled={fetchingInProgress}
            icon={<EditOutlined />}
            type="primary"
            onClick={onSubmit}
          >
            {submitButtonTitle}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
