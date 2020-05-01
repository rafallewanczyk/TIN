import axios from 'axios';
import { DeviceModel } from '../../models/regulator-device-model/RegulatorDeviceModel';
import { BASE_URL } from '../constants';

export const fetchDevices = async (): Promise<DeviceModel[]> => {
  const { data } = await axios.get(`${BASE_URL}/devices`);

  return data;
};
