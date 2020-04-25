import React from 'react';
import { RouteComponentProps } from '@reach/router';
import Title from 'antd/es/typography/Title';
import { Button, PageHeader } from 'antd';
import { DevicesList } from './devices-list/DevicesList';
import { RegulatorDevicesList } from './regulator-devices-list/RegulatorDevicesList';
import style from './AllDevicesList.module.css';

export type DevicesListProps = RouteComponentProps;

export const AllDevicesList: React.FC<DevicesListProps> = (props) => {
  return (
    <div className={style.wrapper}>
      <PageHeader
        extra={[
          <Button key="1" type="primary">
            Refresh all
          </Button>,
        ]}
        title="Devices list"
      />
      <Title level={2}>Regulator devices</Title>
      <RegulatorDevicesList />
      <Title level={2}>Devices</Title>
      <DevicesList />
    </div>
  );
};
