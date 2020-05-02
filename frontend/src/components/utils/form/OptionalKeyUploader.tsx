import React, { ReactNode, useState } from 'react';
import { Switch } from 'antd';
import Text from 'antd/es/typography/Text';
import { FormInstance, FormItemProps } from 'antd/es/form';
import style from '../../new-device/NewDevice.module.css';
import { PublicKeyUploader } from './PublicKeyUploader';

export interface OptionalKeyUploaderProps {
  formProps: Omit<FormItemProps, 'children'>;
  form: FormInstance;
}

export const OptionalKeyUploader: React.FC<OptionalKeyUploaderProps> = ({ formProps, form }) => {
  const [keyUploaderVisible, setKeyUploaderVisible] = useState(false);

  const renderKeyUploaderToggle = (): ReactNode => (
    <div className={style.switchWrapper}>
      <Switch onClick={(toggleOn) => setKeyUploaderVisible(toggleOn)} />
      <Text className={style.switchText}>Would you like to change public key?</Text>
    </div>
  );

  return (
    <>
      {renderKeyUploaderToggle()}
      {keyUploaderVisible && <PublicKeyUploader fieldItemProps={formProps} form={form} />}
    </>
  );
};
