export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  INVALID = 'INVALID',
  CONNECTING = 'CONNECTING',
}

export enum DeviceType {
  TEMPERATURE = 0,
  LIGHT = 1,
}

export class RegulatorModel {
  public constructor(
    public name: string,
    public id: number,
    public status: Status,
    public type: DeviceType,
    public address: string,
    public port: number,
  ) {}
}

export class DeviceModel {
  public constructor(
    public id: number,
    public regulatorId: number,
    public name: string,
    public status: Status,
    public type: DeviceType,
    public address: string,
    public port: number,
  ) {}
}

export class TemperatureDeviceModel extends DeviceModel {
  public constructor(
    id: number,
    regulatorId: number,
    name: string,
    status: Status,
    address: string,
    port: number,
    public data: number | null,
    public targetData: number | null,
  ) {
    super(id, regulatorId, name, status, DeviceType.TEMPERATURE, address, port);
  }
}

export class LightDeviceModel extends DeviceModel {
  public constructor(
    id: number,
    regulatorId: number,
    name: string,
    status: Status,
    address: string,
    port: number,
    public data: boolean | null,
    public targetData: boolean | null,
  ) {
    super(id, regulatorId, name, status, DeviceType.LIGHT, address, port);
  }
}
