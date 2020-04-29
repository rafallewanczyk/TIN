import React from 'react';
import { RouteComponentProps, useNavigate } from '@reach/router';
import {
  DeviceType,
  RegulatorModel,
  Status,
} from '../models/regulator-device-model/RegulatorDeviceModel';
import { NewRegulatorForm } from '../new-regulator/NewRegulatorForm';

interface RouteParams {
  regulatorId: string;
}

export type EditRegulatorFormProps = RouteComponentProps<RouteParams>;

export const EditRegulatorForm: React.FC<EditRegulatorFormProps> = ({ regulatorId }) => {
  const navigate = useNavigate();

  if (!regulatorId) {
    console.log('regulatorId', regulatorId);
    navigate('/newRegulator');

    return null;
  }

  const regulator: RegulatorModel = {
    id: regulatorId,
    name: 'Regulator 4',
    status: Status.CONNECTING,
    type: DeviceType.LIGHT,
  };

  return <NewRegulatorForm regulator={regulator} />;
};
