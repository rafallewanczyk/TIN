import React, { ReactNode } from 'react';
import { Spin, Table, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';
import style from './RegulatorDevicesList.module.css';
import { renderStatusTag } from '../utils/StatusTag';
import {
  RegulatorModel,
  DeviceType,
  Status,
} from '../../models/regulator-device-model/RegulatorDeviceModel';
import { deviceTableColumns } from '../utils/deviceTableColumns';

export interface RegulatorDevicesListProps {}

export const RegulatorDevicesList: React.FC<RegulatorDevicesListProps> = (props) => {
  const data: RegulatorModel[] = [
    {
      name: 'Regulator 1',
      id: '11',
      status: Status.ACTIVE,
      type: DeviceType.TEMPERATURE,
    },
    {
      name: 'Regulator 2',
      id: '12',
      status: Status.INACTIVE,
      type: DeviceType.LIGHT,
    },
    {
      name: 'Regulator 3',
      id: '13',
      status: Status.INVALID,
      type: DeviceType.LIGHT,
    },
    {
      name: 'Regulator 4',
      id: '14',
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
