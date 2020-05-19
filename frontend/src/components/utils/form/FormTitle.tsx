import React, { useEffect } from 'react';
import { Button, PageHeader } from 'antd';
import { useNavigate } from '@reach/router';
import { queryCache, useMutation } from 'react-query';
import style from '../../new-device/NewDevice.module.css';
import { deleteDevice } from '../../rest-client/devices/DevicesRestClient';
import {
  ALL_DEVICES_QUERY,
  ALL_REGULATORS_QUERY,
} from '../../all-devices-list/devices-list/useDevicesQuery';
import { deleteRegulator } from '../../rest-client/devices/RegulatorsRestClient';

export interface FormTitleProps {
  deleteButtonVisible: boolean;
  id: string | undefined;
  subject: 'device' | 'regulator';
  deleteButtonDisabled: boolean;

  onFetchingStateChange(fetching: boolean): void;
}

export const FormTitle: React.FC<FormTitleProps> = ({
  deleteButtonVisible,
  id,
  subject,
  onFetchingStateChange,
  deleteButtonDisabled,
}) => {
  const navigate = useNavigate();
  const title = id ? `Edit ${subject}` : `Add new ${subject}`;
  const queryName = subject === 'device' ? ALL_DEVICES_QUERY : ALL_REGULATORS_QUERY;
  const deleteMutation = subject === 'device' ? deleteDevice : deleteRegulator;
  const [sendDeleteRequest, { status }] = useMutation(deleteMutation, {
    onSuccess: () => {
      queryCache.removeQueries(queryName);
      navigate('/');
    },
  });

  const handleDelete = () => id && sendDeleteRequest({ id });

  useEffect(() => {
    onFetchingStateChange(status === 'loading');
  }, [status]);

  const renderDeleteButton = () => (
    <Button
      className="data-cy-del-btn"
      disabled={deleteButtonDisabled}
      key="1"
      type="danger"
      onClick={handleDelete}
    >
      Delete
    </Button>
  );

  return (
    <div className={style.pageHeaderWrapper}>
      <PageHeader
        className={style.pageHeader}
        extra={[deleteButtonVisible && renderDeleteButton()]}
        subTitle={id && `Id: ${id}`}
        title={title}
        onBack={() => navigate(-1)}
      />
    </div>
  );
};
