import React, { ReactNode } from 'react';
import { Spin, Tag } from 'antd';
import style from '../regulator-devices-list/RegulatorDevicesList.module.css';
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
  const StatusTag = () => {
    return <Tag color={statusData[status].color}>{statusData[status].label}</Tag>;
  };
  const Spinner = () => {
    return (
      <div className={style.spin}>
        <StatusTag />
        <Spin size="small" />
      </div>
    );
  };

  return {
    children: (
      <div className={style.tag}>{status === Status.CONNECTING ? <Spinner /> : <StatusTag />}</div>
    ),
  };
};
