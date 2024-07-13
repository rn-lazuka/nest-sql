import { DeviceViewType } from '../api/models/output/device.output.model';
import { Device } from '../domain/device.schema';

export const convertDeviceToViewModel = (device: Device): DeviceViewType => ({
  deviceId: device.deviceId,
  title: device.title,
  lastActiveDate: device.lastActiveDate,
  ip: device.ip,
});
