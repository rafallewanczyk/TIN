import React, { useRef } from 'react';
import { Table } from 'antd';
import { useNavigate } from '@reach/router';
import produce from 'immer';
import clsx from 'clsx';
import style from './RegulatorDevicesList.module.css';
import { RegulatorModel } from '../../models/regulator-device-model/RegulatorDeviceModel';
import { deviceTableColumns } from '../utils/deviceTableColumns';
import { useTableScroll } from '../utils/useTableScroll';
import { useRegulatorsQuery } from '../devices-list/useDevicesQuery';

export const RegulatorDevicesList: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = useTableScroll(ref, 500);
  const navigate = useNavigate();
  const [regulators, loading] = useRegulatorsQuery();
  const regulatorsWithKeys = regulators?.map((it) =>
    produce(it, (regulatorWithKey) => {
      (regulatorWithKey as RegulatorModel & { key: number }).key = it.id;
    }),
  );

  return (
    <div ref={ref}>
      <Table<RegulatorModel>
        className={clsx(style.wrapper, 'data-cy-regulators-table')}
        columns={deviceTableColumns}
        dataSource={regulatorsWithKeys}
        loading={loading}
        pagination={false}
        scroll={scroll}
        onRow={(record) => ({
          onClick: () => {
            navigate(`/editRegulator/${record.id}`);
          }, // click row
          className: style.row,
        })}
      />
    </div>
  );
};
