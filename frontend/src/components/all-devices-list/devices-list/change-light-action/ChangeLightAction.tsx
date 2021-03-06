import React, { useEffect, useState } from 'react';
import { Spin, Switch, Typography } from 'antd';
import clsx from 'clsx';
import { LightDeviceModel } from '../../../models/regulator-device-model/RegulatorDeviceModel';
import style from '../DevicesList.module.css';
import { stopPropagation } from '../../../utils/callback/callbacks';
import { useChangeTargetDataMutation } from '../utils/useChangeTargetDataMutation';

export interface ChangeLightActionProps {
  device: LightDeviceModel;
}

export const ChangeLightAction: React.FC<ChangeLightActionProps> = ({ device }) => {
  const [isLightOn, setIsLightOn] = useState(device.targetData);
  const [changeDeviceLight, loading] = useChangeTargetDataMutation(device);

  const handleSwitchChange = (value: boolean): void => {
    setIsLightOn(value);
    changeDeviceLight(value);
  };

  useEffect(() => {
    setIsLightOn(device.targetData);
  }, [device.targetData]);

  if (isLightOn === null) return null;

  return (
    <div className={style.switchWrapper} onClick={stopPropagation}>
      <Typography.Text strong className={style.numberInputLabel}>
        Turn {isLightOn ? 'OFF' : 'ON'}
      </Typography.Text>
      <Switch
        checked={isLightOn}
        className="cy-data-light-switch"
        disabled={loading}
        onChange={handleSwitchChange}
      />
      {loading && <Spin className={clsx(style.inputSpin, 'data-cy-spinner')} size="small" />}
    </div>
  );
};
