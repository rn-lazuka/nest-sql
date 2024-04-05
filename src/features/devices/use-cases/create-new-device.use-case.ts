import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtQueryRepository } from '../../jwt/jwt.query.repository';
import { DevicesRepository } from '../infrastructure/repository/devices.repository';
import { UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceModelType } from '../domain/device.schema';
import { DeviceModel } from '../types/device';

export class CreateNewDeviceCommand {
  constructor(
    public ip: string,
    public title: string,
    public userId: string,
    public refreshToken: string,
  ) {}
}

@CommandHandler(CreateNewDeviceCommand)
export class CreateNewDeviceUseCase
  implements ICommandHandler<CreateNewDeviceCommand>
{
  constructor(
    @InjectModel(Device.name)
    private deviceModel: DeviceModelType,
    protected jwtQueryRepository: JwtQueryRepository,
    protected deviceRepository: DevicesRepository,
  ) {}

  async execute(command: CreateNewDeviceCommand): Promise<void> {
    const { refreshToken, userId, ip, title } = command;
    const payloadToken = this.jwtQueryRepository.getPayloadToken(refreshToken);
    if (!payloadToken) {
      throw new UnauthorizedException();
    }
    const device: DeviceModel = {
      ip,
      title,
      userId,
      deviceId: payloadToken.deviceId,
      lastActiveDate: new Date(payloadToken.iat! * 1000).toISOString(),
      expirationDate: payloadToken.exp! - payloadToken.iat!,
    };

    await this.deviceRepository.saveDevice(device);
    return;
  }
}
