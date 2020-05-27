import React, { ReactNode } from 'react';
import { Typography } from 'antd';
import BulbFilled from '@ant-design/icons/BulbFilled';
import { animated, useSpring } from 'react-spring';
import style from '../regulator-devices-list/RegulatorDevicesList.module.css';

const AnimatedText = animated(Typography.Text);
const AnimatedBulb = animated(BulbFilled);

export const LightData: React.FC<{ data: boolean }> = ({ data }) => {
  const color = data ? 'yellow' : 'gray';
  const status = data ? 'ON' : 'OFF';
  const bulbColor = useSpring({ color });

  return (
    <>
      <AnimatedBulb className={style.bulb} style={{ color: bulbColor.color }} />
      Light is {status}
    </>
  );
};

export const TemperatureData: React.FC<{ data: number }> = ({ data }) => {
  const animatedData = useSpring({ number: data, from: { number: 0 } });

  return (
    <>
      Current temperature:
      <AnimatedText>
        {animatedData.number.interpolate((it: number) => ` ${it.toFixed(2)}`)}
      </AnimatedText>
      °C
    </>
  );
};

export const renderDeviceData = (data: boolean | number | null): ReactNode => {
  if (!data && data !== 0 && data !== false)
    return <p className={style.noAvailableData}>No available data</p>;

  return typeof data === 'boolean' ? <LightData data={data} /> : <TemperatureData data={data} />;
};
