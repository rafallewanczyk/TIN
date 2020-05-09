import React, { ReactNode } from 'react';
import { Spin, Tag } from 'antd';
import { Status } from '../../models/regulator-device-model/RegulatorDeviceModel';

const statusData: Record<Status, { color: string; label: string }> = {
  [Status.ACTIVE]: {
    color: 'green',
    label: 'ACTIVE',
  },
  [Status.INACTIVE]: {
    color: 'grey',
    label: 'INACTIVE',
  },
  [Status.INVALID]: {
    color: 'red',
    label: 'INVALID',
  },
  [Status.CONNECTING]: {
    color: 'blue',
    label: 'CONNECTING',
  },
};

export const renderStatusTag = (status: Status): ReactNode => {
  const StatusTag = () => <Tag color={statusData[status].color}>{statusData[status].label}</Tag>;
  const StatusTagWithSpinner = () => (
    <div>
      <StatusTag />
      <Spin size="small" />
    </div>
  );

  return {
    children: <div>{status === Status.CONNECTING ? <StatusTagWithSpinner /> : <StatusTag />}</div>,
  };
};
