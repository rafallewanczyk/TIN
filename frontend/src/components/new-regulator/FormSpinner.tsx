import React from 'react';
import { Spin } from 'antd';
import { animated, useSpring } from 'react-spring';
import style from '../new-device/NewDevice.module.css';
import { stopPropagation } from '../utils/callback/callbacks';

export const FormSpinner: React.FC = () => {
  const props = useSpring({
    to: { transform: 'translateY(0px)' },
    from: { transform: 'translateY(-500px)' },
    delay: 500,
  });

  return (
    <animated.div className={style.wholeScreenSpinner} style={props} onClick={stopPropagation}>
      <Spin size="large" />
    </animated.div>
  );
};
