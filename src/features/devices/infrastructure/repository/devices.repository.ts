import { Injectable } from '@nestjs/common';
import { DeviceModel } from '../../types/device';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DeviceDBType } from '../../domain/devices.db.types';

@Injectable()
export class DevicesRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async saveDevice(device: DeviceModel): Promise<void> {
    await this.dataSource.query(
      `
    INSERT INTO public.devices(ip, title, "lastActiveDate", "deviceId", "userId", "expirationDate")
    VALUES ($1,$2,$3,$4,$5,$6);
    `,
      [
        device.ip,
        device.title,
        device.lastActiveDate,
        device.deviceId,
        device.userId,
        device.expirationDate,
      ],
    );
  }

  async updateDeviceLastActiveDate(
    lastActiveDate: string,
    deviceId: string,
  ): Promise<void> {
    await this.dataSource.query(
      `
      UPDATE public.devices as d
      SET "lastActiveDate"=$1
      WHERE d."deviceId"=$2;
    `,
      [lastActiveDate, deviceId],
    );
  }

  async getDeviceInfo(deviceId: string): Promise<null | DeviceDBType> {
    const res = await this.dataSource.query(
      `
      SELECT u.*
      FROM public.devices as d
      WHERE d."deviceId"=$1;
    `,
      [deviceId],
    );
    return res[0];
  }

  async deleteDevicesExcludeCurrent(deviceId: string): Promise<boolean> {
    await this.dataSource.query(
      `
      DELETE FROM public.devices as d
      WHERE d."deviceId" <> $1;
    `,
      [deviceId],
    );
    return true;
  }

  async deleteDeviceById(deviceId: string): Promise<boolean> {
    await this.dataSource.query(
      `
      DELETE FROM public.devices as d
      WHERE d."deviceId" = $1;
    `,
      [deviceId],
    );
    return true;
  }
}
