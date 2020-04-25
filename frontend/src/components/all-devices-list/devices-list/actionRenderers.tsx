import React, { ReactNode, useEffect, useState } from 'react';
import { Input, InputNumber, Switch, Typography } from 'antd';
import {
  DeviceModel,
  DeviceType,
  LightDeviceModel,
  TemperatureDeviceModel,
} from '../../models/regulator-device-model/RegulatorDeviceModel';
import { useDebounce } from '../../utils/useDebounce';
import style from './DevicesList.module.css';

export const ChangeTemperatureAction: React.FC<{ device: TemperatureDeviceModel }> = (device) => {
  const [defaultValue] = useState(15);
  const changeDeviceTemperature = (value: number | undefined) => console.log(value);
  const handleChange = useDebounce(changeDeviceTemperature, 1000);

  return (
    <>
      <Typography.Text strong className={style.numberInputLabel}>
        Target °C:
      </Typography.Text>
      <InputNumber
        defaultValue={defaultValue}
        max={100}
        min={-100}
        title="dupa"
        onChange={handleChange}
      />
    </>
  );
};

export const ChangeLightAction: React.FC<{ device: LightDeviceModel }> = ({ device }) => {
  const [isLightOn, setIsLightOn] = useState(false);

  console.log(isLightOn);

  return (
    <div className={style.switchWrapper}>
      <Typography.Text strong className={style.numberInputLabel}>
        Turn {isLightOn ? 'OFF' : 'ON'}
      </Typography.Text>
      <Switch onChange={setIsLightOn} />
    </div>
  );
};

export const renderAction = (device: DeviceModel): ReactNode => {
  return device.type === DeviceType.TEMPERATURE ? (
    <ChangeTemperatureAction device={device as TemperatureDeviceModel} />
  ) : (
    <ChangeLightAction device={device as LightDeviceModel} />
  );
};
