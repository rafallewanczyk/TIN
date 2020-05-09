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

export class RegulatorModel {
  public constructor(
    public name: string,
    public id: string,
    public status: Status,
    public type: DeviceType,
    public address: string,
  ) {}
}

export class DeviceModel {
  public constructor(
    public id: string,
    public regulatorId: string,
    public name: string,
    public status: Status,
    public type: DeviceType,
    public address: string,
  ) {}
}

export class TemperatureDeviceModel extends DeviceModel {
  public constructor(
    id: string,
    regulatorId: string,
    name: string,
    status: Status,
    address: string,
    public data: number,
    public targetData: number,
  ) {
    super(id, regulatorId, name, status, DeviceType.TEMPERATURE, address);
  }
}

export class LightDeviceModel extends DeviceModel {
  public constructor(
    id: string,
    regulatorId: string,
    name: string,
    status: Status,
    address: string,
    public data: boolean,
    public targetData: boolean,
  ) {
    super(id, regulatorId, name, status, DeviceType.LIGHT, address);
  }
}
