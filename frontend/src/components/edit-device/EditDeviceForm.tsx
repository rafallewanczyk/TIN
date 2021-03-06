import React from 'react';
import { RouteComponentProps, useNavigate } from '@reach/router';
import { NewDeviceForm } from '../new-device/NewDeviceForm';
import { useFetchDevice } from './useFetchDevice';

interface RouteParams {
  deviceId: string;
}

export type EditDeviceFormProps = RouteComponentProps<RouteParams>;

export const EditDeviceForm: React.FC<EditDeviceFormProps> = ({ deviceId }) => {
  const navigate = useNavigate();
  const parsedDeviceId = parseInt(deviceId || '', 10);
  const device = useFetchDevice(parsedDeviceId);

  if (!device) {
    navigate('/');

    return null;
  }

  return <NewDeviceForm device={device} editMode={Boolean(device)} />;
};
