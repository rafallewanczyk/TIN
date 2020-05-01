import { DeviceType, Status } from '../../models/regulator-device-model/RegulatorDeviceModel';

export interface DeviceModelDTO {
  id: string;
  regulatorId: string;
  name: string;
  status: Status;
  type: DeviceType;
  data: number | boolean;
  targetData: number | boolean;
}
