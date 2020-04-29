import React, { ReactNode, useState } from 'react';
import { Button, Form, Upload } from 'antd';
import { CheckCircleFilled, UploadOutlined } from '@ant-design/icons/lib';
import { FormInstance, FormItemProps, Rule } from 'antd/es/form';
import { UploadChangeParam } from 'antd/es/upload';
import { normFile, publicKeyValidator } from './PublicKeyValidator';
import { NewDeviceFieldNames } from '../../new-device/NewDeviceFormHook';
import style from '../../new-device/NewDevice.module.css';

const doNotSendRequest = () => false;

export interface PublicKeyUploaderProps {
  fieldItemProps: Omit<FormItemProps, 'children'>;
  form: FormInstance;
}

export const PublicKeyUploader: React.FC<PublicKeyUploaderProps> = ({ fieldItemProps, form }) => {
  const rules: Rule[] = [...(fieldItemProps.rules || []), { validator: publicKeyValidator }];
  const [uploadButtonDisabled, setUploadButtonDisabled] = useState(false);

  const isPublicKeyValid = (): boolean => {
    const keyValue = form.getFieldValue(`${fieldItemProps.name}`);
    const keyErrors = form.getFieldError(`${fieldItemProps.name}`);

    return keyValue && keyErrors.length === 0;
  };

  const onUploadStateChange = ({ fileList }: UploadChangeParam): void => {
    setUploadButtonDisabled(fileList.length >= 1);
  };

  const renderUploadLabel = (): ReactNode => (
    <>
      {fieldItemProps.label}
      {isPublicKeyValid() && <CheckCircleFilled className={style.publicKeyValidIcon} />}
    </>
  );

  return (
    <Form.Item
      getValueFromEvent={normFile}
      {...fieldItemProps}
      label={renderUploadLabel()}
      rules={rules}
    >
      <Upload
        accept=".txt,.rsa"
        beforeUpload={doNotSendRequest}
        listType="text"
        name={`${fieldItemProps.name}`}
        onChange={onUploadStateChange}
      >
        <Button disabled={uploadButtonDisabled}>
          <UploadOutlined /> Click to upload
        </Button>
      </Upload>
    </Form.Item>
  );
};
