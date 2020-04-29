import React from 'react';
import { Table } from 'antd';
import style from './RegulatorDevicesList.module.css';
import {
  DeviceType,
  RegulatorModel,
  Status,
} from '../../models/regulator-device-model/RegulatorDeviceModel';
import { deviceTableColumns } from '../utils/deviceTableColumns';

export interface RegulatorDevicesListProps {}

export const RegulatorDevicesList: React.FC<RegulatorDevicesListProps> = () => {
  const data: (RegulatorModel & { key: string })[] = [
    {
      key: '11',
      name: 'Regulator 1',
      id: '11',
      status: Status.ACTIVE,
      type: DeviceType.TEMPERATURE,
    },
    {
      name: 'Regulator 2',
      id: '12',
      key: '12',
      status: Status.INACTIVE,
      type: DeviceType.LIGHT,
    },
    {
      name: 'Regulator 3',
      id: '13',
      key: '13',
      status: Status.INVALID,
      type: DeviceType.LIGHT,
    },
    {
      name: 'Regulator 4',
      id: '14',
      key: '14',
      status: Status.CONNECTING,
      type: DeviceType.LIGHT,
    },
  ];

  return (
    <Table
      className={style.wrapper}
      columns={deviceTableColumns}
      dataSource={data}
      pagination={false}
      scroll={{ x: 700 }}
    />
  );
};
