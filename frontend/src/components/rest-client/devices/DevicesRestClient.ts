import axios from 'axios';
import { MutationFunction } from 'react-query';
import { DeviceModel } from '../../models/regulator-device-model/RegulatorDeviceModel';
import { BASE_URL } from '../constants';
import { DeviceModelDTO } from './DevicesDTO';

export const fetchDevices = async (): Promise<DeviceModel[]> => {
  const { data } = await axios.get<DeviceModelDTO[]>(`${BASE_URL}/devices`);

  return data;
};

export const changeTargetData: MutationFunction<void,
  { id: string; targetData: number | boolean }> = async ({ id, targetData }): Promise<void> => {
  const { data } = await axios.post<void>(`${BASE_URL}/devices/setTargetData`, {
    id,
    targetData,
  });

  return data;
};
