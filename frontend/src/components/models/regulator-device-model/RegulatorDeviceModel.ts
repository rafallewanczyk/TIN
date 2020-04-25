export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  INVALID = 'INVALID',
  CONNECTING = 'CONNECTING',
}

export enum DeviceType {
  TEMPERATURE = 'TEMPERATURE',
  LIGHT = 'LIGHT',
}

export interface RegulatorModel {
  name: string;
  id: string;
  status: Status;
  type: DeviceType;
}

export interface DeviceModel {
  name: string;
  id: string;
  status: Status;
  type: DeviceType;
}

export interface TemperatureDeviceModel extends DeviceModel {
  name: string;
  id: string;
  status: Status;
  type: DeviceType.TEMPERATURE;
  data: number;
}

export interface LightDeviceModel extends DeviceModel {
  name: string;
  id: string;
  status: Status;
  type: DeviceType.LIGHT;
  data: boolean;
}
