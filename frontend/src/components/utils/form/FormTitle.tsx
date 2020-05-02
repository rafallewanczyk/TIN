import React from 'react';
import { Button, PageHeader } from 'antd';
import { useNavigate } from '@reach/router';
import style from '../../new-device/NewDevice.module.css';

export interface FormTitleProps {
  deleteButtonVisible: boolean;
  id: string | undefined;
  titleSubject: 'device' | 'regulator';
}

export const FormTitle: React.FC<FormTitleProps> = ({ deleteButtonVisible, id, titleSubject }) => {
  const navigate = useNavigate();
  const title = id ? `Edit ${titleSubject}` : `Add new ${titleSubject}`;

  const renderDeleteButton = () => (
    <Button key="1" type="danger">
      Delete
    </Button>
  );

  return (
    <PageHeader
      className={style.pageHeader}
      extra={[deleteButtonVisible && renderDeleteButton()]}
      subTitle={id && `Id: ${id}`}
      title={title}
      onBack={() => navigate(-1)}
    />
  );
};
