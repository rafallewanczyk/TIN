import axios from 'axios';
import { MutationFunction } from 'react-query';
import { DeviceModel, DeviceType } from '../../models/regulator-device-model/RegulatorDeviceModel';
import { BASE_URL } from '../constants';

export const fetchDevices = async (): Promise<DeviceModel[]> => {
  const { data } = await axios.get<DeviceModel[]>(`${BASE_URL}/devices`);

  return data;
};

export const changeTargetData: MutationFunction<
  void,
  { id: number; targetData: number | boolean }
> = async ({ id, targetData }): Promise<void> => {
  const url =
    typeof targetData === 'number'
      ? `${BASE_URL}/devices/temperature/setTargetData`
      : `${BASE_URL}/devices/light/setTargetData`;

  const { data } = await axios.post<void>(url, {
    id,
    targetData,
  });

  return data;
};

export const deleteDevice: MutationFunction<void, { id: number }> = async ({
  id,
}): Promise<void> => {
  const { data } = await axios.delete<void>(`${BASE_URL}/devices/${id}`);

  return data;
};

export interface NewDeviceRequestDTO {
  id: number;
  name: string;
  regulatorId: number;
  type: DeviceType;
  publicKey: string;
  port: number;
  address: string;
}

export const addNewDevice: MutationFunction<void, NewDeviceRequestDTO> = async (
  request,
): Promise<void> => {
  const { data } = await axios.post<void>(`${BASE_URL}/devices`, request);

  return data;
};

export type EditDeviceRequestDTO = Partial<NewDeviceRequestDTO>;

export const editDeviceWithId = (id: number) => async (request: EditDeviceRequestDTO) => {
  const { data } = await axios.patch<void>(`${BASE_URL}/devices/${id}`, request);

  return data;
};
