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
