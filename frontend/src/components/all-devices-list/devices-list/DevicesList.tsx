import React, { useRef } from 'react';
import { Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import style from '../regulator-devices-list/RegulatorDevicesList.module.css';
import {
  DeviceModel,
  DeviceType,
  LightDeviceModel,
  Status,
  TemperatureDeviceModel,
} from '../../models/regulator-device-model/RegulatorDeviceModel';
import { deviceTableColumns } from '../utils/deviceTableColumns';
import { renderDeviceData } from './dataRenderers';
import { renderAction } from './actionRenderers';
import { useTableScroll } from '../utils/useTableScroll';

export interface DevicesListProps {}

const columns: ColumnsType<DeviceModel> = [
  ...deviceTableColumns.filter((column) => column.key !== 'type'),
  {
    title: 'State',
    dataIndex: 'data',
    key: 'state',
    render: renderDeviceData,
  },
  {
    title: 'Action',
    key: 'action',
    render: renderAction,
  },
];

export const DevicesList: React.FC<DevicesListProps> = () => {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = useTableScroll(ref, 700);
  const data: ((TemperatureDeviceModel | LightDeviceModel) & { key: string })[] = [
    {
      name: 'Regulator 1',
      id: '11',
      key: '11',
      status: Status.ACTIVE,
      type: DeviceType.TEMPERATURE,
      data: 12.12,
    },
    {
      name: 'Regulator 2',
      id: '12',
      key: '12',
      status: Status.INACTIVE,
      type: DeviceType.LIGHT,
      data: true,
    },
    {
      name: 'Regulator 3',
      id: '13',
      key: '13',
      status: Status.INVALID,
      type: DeviceType.LIGHT,
      data: true,
    },
    {
      name: 'Regulator 4',
      id: '14',
      key: '14',
      status: Status.CONNECTING,
      type: DeviceType.LIGHT,
      data: false,
    },
  ];

  return (
    <Table
      className={style.wrapper}
      columns={columns}
      dataSource={data}
      pagination={false}
      scroll={scroll}
    />
  );
};
