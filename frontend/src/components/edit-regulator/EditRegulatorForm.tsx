import React from 'react';
import { RouteComponentProps, useNavigate } from '@reach/router';
import { NewRegulatorForm } from '../new-regulator/NewRegulatorForm';
import { useFetchRegulator } from './useFetchRegulator';

interface RouteParams {
  regulatorId: string;
}

export type EditRegulatorFormProps = RouteComponentProps<RouteParams>;

export const EditRegulatorForm: React.FC<EditRegulatorFormProps> = ({ regulatorId }) => {
  const navigate = useNavigate();
  const parsedDeviceId = parseInt(regulatorId || '', 10);
  const regulator = useFetchRegulator(parsedDeviceId);

  if (!regulator) {
    navigate('/newRegulator');

    return null;
  }

  return <NewRegulatorForm regulator={regulator} />;
};
