import React from 'react';
import { RouteComponentProps, useNavigate } from '@reach/router';
import {
  DeviceType,
  LightDeviceModel,
  Status,
  TemperatureDeviceModel,
} from '../models/regulator-device-model/RegulatorDeviceModel';
import { NewDeviceForm } from '../new-device/NewDeviceForm';

interface RouteParams {
  deviceId: string;
}

export type EditDeviceFormProps = RouteComponentProps<RouteParams>;

export const EditDeviceForm: React.FC<EditDeviceFormProps> = ({ deviceId }) => {
  const navigate = useNavigate();

  if (!deviceId) {
    console.log('deviceId', deviceId);
    navigate('/newDevice');

    return null;
  }

  const device: TemperatureDeviceModel | LightDeviceModel = {
    id: deviceId,
    regulatorId: '14',
    name: 'Regulator 4',
    status: Status.CONNECTING,
    type: DeviceType.LIGHT,
    data: false,
  };

  return <NewDeviceForm device={device} />;
};
