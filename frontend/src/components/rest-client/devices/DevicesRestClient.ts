import axios from 'axios';
import { MutationFunction } from 'react-query';
import { DeviceModel } from '../../models/regulator-device-model/RegulatorDeviceModel';
import { BASE_URL } from '../constants';

export const fetchDevices = async (): Promise<DeviceModel[]> => {
  const { data } = await axios.get<DeviceModel[]>(`${BASE_URL}/devices`);

  return data;
};

export const changeTargetData: MutationFunction<
  void,
  { id: string; targetData: number | boolean }
> = async ({ id, targetData }): Promise<void> => {
  const { data } = await axios.post<void>(`${BASE_URL}/devices/setTargetData`, {
    id,
    targetData,
  });

  return data;
};

export const deleteDevice: MutationFunction<void, { id: string }> = async ({
  id,
}): Promise<void> => {
  const { data } = await axios.delete<void>(`${BASE_URL}/devices/${id}`);

  return data;
};

export interface NewDeviceRequestDTO {
  name: string;
  regulatorId: string;
  publicKey: string;
  address: string;
}

export const addNewDevice: MutationFunction<void, NewDeviceRequestDTO> = async (
  request,
): Promise<void> => {
  const { data } = await axios.post<void>(`${BASE_URL}/devices`, request);

  return data;
};

export type EditDeviceRequestDTO = Partial<NewDeviceRequestDTO>;

export const editDeviceWithId = (id: string) => async (request: EditDeviceRequestDTO) => {
  const { data } = await axios.patch<void>(`${BASE_URL}/devices/${id}`, request);

  return data;
};
