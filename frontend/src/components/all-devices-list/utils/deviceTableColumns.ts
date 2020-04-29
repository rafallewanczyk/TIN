import { ColumnsType } from 'antd/es/table';
import { renderStatusTag } from './StatusTag';
import { capitalize } from '../../utils/string/stringUtils';

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
    render: capitalize,
  },
];
