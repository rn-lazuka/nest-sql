import { Injectable } from '@nestjs/common';
import { DeviceDBType } from '../../domain/devices.db.types';
import { DeviceViewType } from '../../api/models/output/device.output.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { convertDeviceToViewModel } from '../../features/device.function.helper';

@Injectable()
export class DevicesQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getAllDevicesByUserId(userId: string): Promise<DeviceViewType[]> {
    const res = await this.dataSource.query(
      `
      SELECT d.*
      FROM public.devices as d
      WHERE d."userId" = $1;
    `,
      [userId],
    );
    return res.map((device: DeviceDBType) => convertDeviceToViewModel(device));
  }

  async getDeviceById(deviceId: string): Promise<DeviceDBType | null> {
    const res = await this.dataSource.query(
      `
      SELECT d.*
      FROM public.devices as d
      WHERE d."deviceId" = $1;
    `,
      [deviceId],
    );

    return res[0];
  }
}
