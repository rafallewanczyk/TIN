import React from 'react';
import { RouteComponentProps } from '@reach/router';
import Title from 'antd/es/typography/Title';
import { Button, PageHeader } from 'antd';
import { queryCache } from 'react-query';
import { DevicesList } from './devices-list/DevicesList';
import { RegulatorDevicesList } from './regulator-devices-list/RegulatorDevicesList';
import style from './AllDevicesList.module.css';
import {
  ALL_DEVICES_QUERY,
  ALL_REGULATORS_QUERY,
  useDevicesQuery,
  useRegulatorsQuery,
} from './devices-list/useDevicesQuery';

const RefreshBtnCyClass = 'data-cy-refresh-all-btn';

export type DevicesListProps = RouteComponentProps;

export const AllDevicesList: React.FC<DevicesListProps> = (props) => {
  const refreshDevicesAndRegulators = async (): Promise<void> => {
    await queryCache.refetchQueries(ALL_DEVICES_QUERY);
    await queryCache.refetchQueries(ALL_REGULATORS_QUERY);
  };

  const [devices, devicesLoading] = useDevicesQuery();
  const [regulators, regulatorsLoading] = useRegulatorsQuery(devicesLoading);

  const Header = () => (
    <PageHeader
      extra={[
        <Button
          className={RefreshBtnCyClass}
          key="1"
          type="primary"
          onClick={refreshDevicesAndRegulators}
        >
          Refresh all
        </Button>,
      ]}
      title="Devices list"
    />
  );

  return (
    <div className={style.wrapper}>
      <Header />
      <Title level={2}>Regulator devices</Title>
      <RegulatorDevicesList loading={regulatorsLoading} regulators={regulators} />
      <Title level={2}>Devices</Title>
      <DevicesList devices={devices} loading={devicesLoading} />
    </div>
  );
};
