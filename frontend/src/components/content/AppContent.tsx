import React from 'react';
import style from './AppContent.module.css';
import { AllDevicesList } from '../all-devices-list/AllDevicesList';
import { NewDevice } from '../new-device/NewDevice';
import { Router } from '@reach/router';
import { NewRegulator } from '../new-regulator/NewRegulator';

export interface AppContentProps {}

export const AppContent: React.FC<AppContentProps> = (props) => {
  return (
    <div className={style.content}>
      <Router>
        <AllDevicesList path="/" />
        <NewDevice path="/newDevice" />
        <NewRegulator path="/newRegulator" />
      </Router>
    </div>
  );
};
