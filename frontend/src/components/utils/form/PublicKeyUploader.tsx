import React from 'react';
import { Button, Form, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons/lib';
import { FormItemProps, Rule } from 'antd/es/form';
import { normFile, publicKeyValidator } from './PublicKeyValidator';
import { UploadChangeParam } from 'antd/es/upload';
import { UploadFile } from 'antd/es/upload/interface';

const doNotSendRequest = () => false;

export interface PublicKeyUploaderProps {
  fieldItemProps: Omit<FormItemProps, 'children'>;
  buttonDisabled: boolean;

  onChange(changeParam: UploadChangeParam<UploadFile<any>>): void;
}

export const PublicKeyUploader: React.FC<PublicKeyUploaderProps> = ({
  buttonDisabled,
  fieldItemProps,
  onChange,
}) => {
  const rules: Rule[] = [...(fieldItemProps.rules || []), { validator: publicKeyValidator }];

  return (
    <Form.Item {...fieldItemProps} getValueFromEvent={normFile} rules={rules}>
      <Upload
        accept=".txt,.rsa"
        beforeUpload={doNotSendRequest}
        listType="text"
        name={`${fieldItemProps.name}`}
        onChange={onChange}
      >
        <Button disabled={buttonDisabled}>
          <UploadOutlined /> Click to upload
        </Button>
      </Upload>
    </Form.Item>
  );
};
