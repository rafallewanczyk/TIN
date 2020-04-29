import React from 'react';
import { Router } from '@reach/router';
import style from './AppContent.module.css';
import { AllDevicesList } from '../all-devices-list/AllDevicesList';
import { NewDeviceForm } from '../new-device/NewDeviceForm';
import { NewRegulatorForm } from '../new-regulator/NewRegulatorForm';
import { EditDeviceForm } from '../edit-device/EditDeviceForm';
import { EditRegulatorForm } from '../edit-regulator/EditRegulatorForm';

export interface AppContentProps {}

export const AppContent: React.FC<AppContentProps> = (props) => (
  <div className={style.content}>
    <Router>
      <AllDevicesList path="/" />
      <NewDeviceForm path="/newDevice" />
      <NewRegulatorForm path="/newRegulator" />
      <EditDeviceForm path="/editDevice/:deviceId" />
      <EditRegulatorForm path="/editRegulator/:regulatorId" />
    </Router>
  </div>
);
