import axios from 'axios';
import { MutationFunction } from 'react-query';
import {
  DeviceType,
  RegulatorModel,
} from '../../models/regulator-device-model/RegulatorDeviceModel';
import { BASE_URL } from '../constants';

export const fetchRegulators = async (): Promise<RegulatorModel[]> => {
  const { data } = await axios.get<RegulatorModel[]>(`${BASE_URL}/regulators`);

  return data;
};

export const deleteRegulator: MutationFunction<void, { id: string }> = async ({
  id,
}): Promise<void> => {
  const { data } = await axios.delete<void>(`${BASE_URL}/regulators/${id}`);

  return data;
};

export interface NewRegulatorRequestDTO {
  name: string;
  type: DeviceType;
  publicKey: string;
}

export const addNewRegulator: MutationFunction<void, NewRegulatorRequestDTO> = async (
  request,
): Promise<void> => {
  const { data } = await axios.post<void>(`${BASE_URL}/regulators`, request);

  return data;
};

export type EditRegulatorRequestDTO = Partial<NewRegulatorRequestDTO>;

export const editRegulatorWithId = (id: string) => async (request: EditRegulatorRequestDTO) => {
  const { data } = await axios.patch<void>(`${BASE_URL}/regulators/${id}`, request);

  return data;
};
