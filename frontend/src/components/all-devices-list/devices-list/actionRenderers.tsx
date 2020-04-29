import React, { ReactNode, useState } from 'react';
import { InputNumber, Switch, Typography } from 'antd';
import {
  DeviceModel,
  DeviceType,
  LightDeviceModel,
  TemperatureDeviceModel,
} from '../../models/regulator-device-model/RegulatorDeviceModel';
import { useDebounce } from '../../utils/useDebounce';
import style from './DevicesList.module.css';

const stopPropagation = (e: { stopPropagation: () => void }) => e.stopPropagation();

export const ChangeTemperatureAction: React.FC<{ device: TemperatureDeviceModel }> = (device) => {
  const [defaultValue] = useState(15);
  const changeDeviceTemperature = (value: number | undefined) => console.log(value);
  const handleChange = useDebounce(changeDeviceTemperature, 1000);

  return (
    <div onClick={stopPropagation}>
      <Typography.Text strong className={style.numberInputLabel}>
        Target °C:
      </Typography.Text>
      <InputNumber
        defaultValue={defaultValue}
        max={100}
        min={-100}
        title="New temperature"
        onChange={handleChange}
      />
    </div>
  );
};

export const ChangeLightAction: React.FC<{ device: LightDeviceModel }> = ({ device }) => {
  const [isLightOn, setIsLightOn] = useState(false);

  console.log(isLightOn);

  return (
    <div className={style.switchWrapper} onClick={stopPropagation}>
      <Typography.Text strong className={style.numberInputLabel}>
        Turn {isLightOn ? 'OFF' : 'ON'}
      </Typography.Text>
      <Switch onChange={setIsLightOn} />
    </div>
  );
};

export const renderAction = (device: DeviceModel): ReactNode =>
  device.type === DeviceType.TEMPERATURE ? (
    <ChangeTemperatureAction device={device as TemperatureDeviceModel} />
  ) : (
    <ChangeLightAction device={device as LightDeviceModel} />
  );
