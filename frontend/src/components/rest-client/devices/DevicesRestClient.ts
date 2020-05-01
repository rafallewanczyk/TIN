import axios from 'axios';
import { DeviceModel } from '../../models/regulator-device-model/RegulatorDeviceModel';
import { BASE_URL } from '../constants';
import { DeviceModelDTO } from './DevicesDTO';

export const fetchDevices = async (): Promise<DeviceModel[]> => {
  const { data } = await axios.get<DeviceModelDTO[]>(`${BASE_URL}/devices`);

  return data;
};
