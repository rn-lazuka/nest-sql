import { DeviceDBType } from '../domain/devices.db.types';
import { DeviceViewType } from '../api/models/output/device.output.model';

export const convertDeviceToViewModel = (
  device: DeviceDBType,
): DeviceViewType => ({
  deviceId: device.deviceId,
  title: device.title,
  lastActiveDate: device.lastActiveDate,
  ip: device.ip,
});
