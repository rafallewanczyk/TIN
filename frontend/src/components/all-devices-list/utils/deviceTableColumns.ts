import { ColumnsType } from 'antd/es/table';
import { RegulatorModel } from '../../models/regulator-device-model/RegulatorDeviceModel';
import { renderStatusTag } from './StatusTag';

export const deviceTableColumns: ColumnsType<RegulatorModel> = [
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
    width: 150,
  },
  {
    title: 'Status',
    key: 'status',
    width: 200,
    dataIndex: 'status',
    render: renderStatusTag,
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    render: (text: string) => text[0].toLocaleUpperCase() + text.substring(1).toLowerCase(),
  },
];
