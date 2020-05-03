import React, { Suspense } from 'react';
import { Router } from '@reach/router';
import { Spin } from 'antd';
import { ReactQueryConfigProvider, ReactQueryProviderConfig } from 'react-query';
import Title from 'antd/es/typography/Title';
import style from './AppContent.module.css';
import { AllDevicesList } from '../all-devices-list/AllDevicesList';
import { NewDeviceForm } from '../new-device/NewDeviceForm';
import { NewRegulatorForm } from '../new-regulator/NewRegulatorForm';
import { EditDeviceForm } from '../edit-device/EditDeviceForm';
import { EditRegulatorForm } from '../edit-regulator/EditRegulatorForm';
import { sendServerError } from '../utils/error/errors';
import errorImage from './error.svg';

const FullscreenSpinner: React.FC = () => <Spin className={style.fullscreenSpinner} size="large" />;

const reactQueryConfig: ReactQueryProviderConfig = { onError: sendServerError };

class ErrorBoundary extends React.Component<{}, { hasError: boolean }> {
  private LOGO_SIZE = 300;

  constructor(props: {}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  render() {
    const { hasError } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div className={style.errorMessage}>
          <Title level={1}>
            Something is not ok. Please check internet connection and reload the page.
          </Title>
          <img alt="logo" height={this.LOGO_SIZE} src={errorImage} width={this.LOGO_SIZE} />
        </div>
      );
    }

    return children;
  }
}

export const AppContent: React.FC = () => (
  <div className={style.content}>
    <ReactQueryConfigProvider config={reactQueryConfig}>
      <ErrorBoundary>
        <Suspense fallback={<FullscreenSpinner />}>
          <Router>
            <AllDevicesList path="/" />
            <NewDeviceForm path="/newDevice" />
            <NewRegulatorForm path="/newRegulator" />
            <EditDeviceForm path="/editDevice/:deviceId" />
            <EditRegulatorForm path="/editRegulator/:regulatorId" />
          </Router>
        </Suspense>
      </ErrorBoundary>
    </ReactQueryConfigProvider>
  </div>
);
