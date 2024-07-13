import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Device } from '../../domain/device.schema';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Device)
    private readonly devicesRepository: Repository<Device>,
  ) {}

  async save(device: Device): Promise<void> {
    await this.devicesRepository.save(device);
  }

  async deleteDevicesExcludeCurrent(
    deviceId: string,
    userId: string,
  ): Promise<boolean> {
    const res = await this.devicesRepository
      .createQueryBuilder()
      .delete()
      .where('userId = :userId AND id != :currentDeviceId', {
        deviceId,
        userId,
      })
      .execute();

    return !!res.affected;
  }

  async deleteDeviceById(deviceId: string): Promise<boolean> {
    const res = await this.devicesRepository
      .createQueryBuilder()
      .delete()
      .where('deviceId = :deviceId', {
        deviceId,
      })
      .execute();

    return !!res.affected;
  }
}
