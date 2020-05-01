import React, { useEffect, useRef, useState } from 'react';
import { Table } from 'antd';
import axios from 'axios';
import { ColumnsType } from 'antd/es/table';
import { useNavigate } from '@reach/router';
import style from '../regulator-devices-list/RegulatorDevicesList.module.css';
import { DeviceModel } from '../../models/regulator-device-model/RegulatorDeviceModel';
import { deviceTableColumns } from '../utils/deviceTableColumns';
import { renderDeviceData } from './dataRenderers';
import { renderAction } from './actionRenderers';
import { useTableScroll } from '../utils/useTableScroll';
import { useDevicesQuery } from './useDevicesQuery';

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
  const navigate = useNavigate();
  const [devices, loading] = useDevicesQuery();

  return (
    <Table
      className={style.wrapper}
      columns={columns}
      dataSource={devices}
      loading={loading}
      pagination={false}
      scroll={scroll}
      onRow={(record) => ({
        onClick: () => {
          navigate(`/editDevice/${record.id}`);
        }, // click row
        className: style.row,
      })}
    />
  );
};
