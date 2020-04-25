import React from 'react';
import { RouteComponentProps } from '@reach/router';

export interface NewDeviceProps extends RouteComponentProps {  }

export const NewDevice: React.FC<NewDeviceProps> = (props) => {
  return (
    <div>Hello new device</div>
  );
};
