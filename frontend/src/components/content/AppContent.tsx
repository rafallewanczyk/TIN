import React, { ReactNode, Suspense } from 'react';
import { Router } from '@reach/router';
import { Spin } from 'antd';
import style from './AppContent.module.css';
import { AllDevicesList } from '../all-devices-list/AllDevicesList';
import { NewDeviceForm } from '../new-device/NewDeviceForm';
import { NewRegulatorForm } from '../new-regulator/NewRegulatorForm';
import { EditDeviceForm } from '../edit-device/EditDeviceForm';
import { EditRegulatorForm } from '../edit-regulator/EditRegulatorForm';

export interface AppContentProps {}

const FullscreenSpinner: React.FC = () => <Spin className={style.fullscreenSpinner} size="large" />;

export const AppContent: React.FC<AppContentProps> = (props) => (
  <div className={style.content}>
    <Suspense fallback={<FullscreenSpinner />}>
      <Router>
        <AllDevicesList path="/" />
        <NewDeviceForm path="/newDevice" />
        <NewRegulatorForm path="/newRegulator" />
        <EditDeviceForm path="/editDevice/:deviceId" />
        <EditRegulatorForm path="/editRegulator/:regulatorId" />
      </Router>
    </Suspense>
  </div>
);
