import React, { ReactNode, useRef } from 'react';
import { Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useNavigate } from '@reach/router';
import produce from 'immer';
import clsx from 'clsx';
import style from '../regulator-devices-list/RegulatorDevicesList.module.css';
import {
  DeviceModel,
  DeviceType,
  LightDeviceModel,
  TemperatureDeviceModel,
} from '../../models/regulator-device-model/RegulatorDeviceModel';
import { deviceTableColumns } from '../utils/deviceTableColumns';
import { renderDeviceData } from './dataRenderers';
import { useTableScroll } from '../utils/useTableScroll';
import { ChangeTemperatureAction } from './change-temperature-action/ChangeTemperatureAction';
import { ChangeLightAction } from './change-light-action/ChangeLightAction';

const renderAction = (device: DeviceModel): ReactNode =>
  device.type === DeviceType.TEMPERATURE ? (
    <ChangeTemperatureAction device={device as TemperatureDeviceModel} />
  ) : (
    <ChangeLightAction device={device as LightDeviceModel} />
  );

const columns: ColumnsType<DeviceModel> = [
  ...deviceTableColumns.filter((column) => column.key !== 'type'),
  {
    title: 'State',
    dataIndex: 'data',
    width: 250,
    key: 'state',
    render: renderDeviceData,
  },
  {
    title: 'Action',
    key: 'action',
    render: renderAction,
  },
];

interface RegulatorDevicesListProps {
  devices: DeviceModel[] | undefined;
  loading: boolean;
}

export const DevicesList: React.FC<RegulatorDevicesListProps> = ({ devices, loading }) => {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = useTableScroll(ref, 700);
  const navigate = useNavigate();
  const devicesWithKeys = devices?.map((it) =>
    produce(it, (deviceWithKey) => {
      (deviceWithKey as DeviceModel & { key: number }).key = it.id;
    }),
  );

  return (
    <Table
      className={clsx(style.wrapper, 'data-cy-devices-table')}
      columns={columns}
      data-cy="devices-table"
      dataSource={devicesWithKeys}
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
