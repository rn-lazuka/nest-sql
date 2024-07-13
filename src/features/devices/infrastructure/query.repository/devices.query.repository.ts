import { Injectable } from '@nestjs/common';
import { DeviceViewType } from '../../api/models/output/device.output.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { convertDeviceToViewModel } from '../../features/device.function.helper';
import { Device } from '../../domain/device.schema';

@Injectable()
export class DevicesQueryRepository {
  constructor(
    @InjectRepository(Device)
    private readonly devicesQueryRepository: Repository<Device>,
  ) {}

  async getAllDevicesByUserId(userId: string): Promise<DeviceViewType[]> {
    const res = await this.devicesQueryRepository.findBy({ userId });
    return res.map((device) => convertDeviceToViewModel(device));
  }

  async getDeviceById(deviceId: string): Promise<Device | null> {
    const res = await this.devicesQueryRepository.findOneBy({ deviceId });
    return res;
  }
}
