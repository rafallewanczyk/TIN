import React, { ReactNode } from 'react';
import { RouteComponentProps } from '@reach/router';
import { Button, Form, Input, Select } from 'antd';
import { FormItemProps } from 'antd/es/form';
import EditOutlined from '@ant-design/icons/EditOutlined';
import style from '../new-device/NewDevice.module.css';
import { PublicKeyUploader } from '../utils/form/PublicKeyUploader';
import { NewRegulatorFieldNames, useNewRegulatorForm } from './NewRegulatorFormHook';
import { DeviceType, RegulatorModel } from '../models/regulator-device-model/RegulatorDeviceModel';
import { capitalize } from '../utils/string/stringUtils';
import { FormTitle } from '../utils/form/FormTitle';
import { OptionalKeyUploader } from '../utils/form/OptionalKeyUploader';

export interface NewRegulatorProps extends RouteComponentProps {
  regulator?: RegulatorModel;
}

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

export const NewRegulatorForm: React.FC<NewRegulatorProps> = ({ regulator }) => {
  const { form, onSubmit, initialValues } = useNewRegulatorForm(regulator);
  const editMode = !!regulator;
  const submitButtonTitle = editMode ? 'Edit regulator' : 'Add regulator';

  const renderDeviceTypeOption = (type: DeviceType): ReactNode => (
    <Option key={type} value={type}>
      {capitalize(type)}
    </Option>
  );

  return (
    <div className={style.wrapper}>
      <FormTitle deleteButtonVisible={editMode} id={regulator?.id} titleSubject="regulator" />
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
        <Form.Item {...fields.type}>
          <Select>
            {renderDeviceTypeOption(DeviceType.LIGHT)}
            {renderDeviceTypeOption(DeviceType.TEMPERATURE)}
          </Select>
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
