import { ColumnsType } from 'antd/es/table';
import { renderStatusTag } from './StatusTag';
import { renderDeviceType } from '../../enum-renderers/deviceTypeRenderer';

export const deviceTableColumns: ColumnsType<any> = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 150,
  },
  {
    title: 'Id',
    dataIndex: 'id',
    key: 'id',
    width: 100,
  },
  {
    title: 'Status',
    key: 'status',
    width: 180,
    dataIndex: 'status',
    render: renderStatusTag,
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    render: renderDeviceType,
  },
];
