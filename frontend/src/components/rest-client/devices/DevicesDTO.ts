import { DeviceType, Status } from '../../models/regulator-device-model/RegulatorDeviceModel';

export interface DeviceModel {
  id: string;
  regulatorId: string;
  name: string;
  status: Status;
  type: DeviceType;
}

export interface TemperatureDeviceModel extends DeviceModel {
  id: string;
  name: string;
  status: Status;
  type: DeviceType.TEMPERATURE;
  data: number;
}

export interface LightDeviceModel extends DeviceModel {
  id: string;
  name: string;
  status: Status;
  type: DeviceType.LIGHT;
  data: boolean;
}
