import React, { useEffect, useState } from 'react';
import { InputNumber, Spin, Typography } from 'antd';
import { useDebounce } from '../../../utils/useDebounce';
import { stopPropagation } from '../../../utils/callback/callbacks';
import style from '../DevicesList.module.css';
import { TemperatureDeviceModel } from '../../../models/regulator-device-model/RegulatorDeviceModel';
import { useChangeTargetDataMutation } from '../utils/useChangeTargetDataMutation';

interface ChangeTemperatureActionProps {
  device: TemperatureDeviceModel;
}

const DEBOUNCE_TIME = 1000;

export const ChangeTemperatureAction: React.FC<ChangeTemperatureActionProps> = ({ device }) => {
  const [targetValue, setTargetValue] = useState<number | null>(device.targetData);
  const [changeDeviceTemperature, loading] = useChangeTargetDataMutation(device);
  const [sendDelayedChangeRequest, isDebouncing] = useDebounce(
    changeDeviceTemperature,
    DEBOUNCE_TIME,
  );

  const handleInputChange = (value: number | undefined): void => {
    setTargetValue(value || null);
    sendDelayedChangeRequest(value);
  };

  useEffect(() => {
    if (!loading && !isDebouncing) {
      setTargetValue(device.targetData);
    }
  }, [device.targetData]);

  if (targetValue === null) return null;

  return (
    <div onClick={stopPropagation}>
      <Typography.Text strong className={style.numberInputLabel}>
        Target °C:
      </Typography.Text>
      <InputNumber
        defaultValue={targetValue}
        disabled={loading}
        max={100}
        min={-100}
        title="New temperature"
        value={targetValue}
        onChange={handleInputChange}
      />
      {loading && <Spin className={style.inputSpin} size="small" />}
    </div>
  );
};
