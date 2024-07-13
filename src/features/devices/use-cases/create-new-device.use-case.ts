import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtQueryRepository } from '../../jwt/jwt.query.repository';
import { DevicesRepository } from '../infrastructure/repository/devices.repository';
import { UnauthorizedException } from '@nestjs/common';
import { Device } from '../domain/device.schema';

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
    protected jwtQueryRepository: JwtQueryRepository,
    protected deviceRepository: DevicesRepository,
  ) {}

  async execute(command: CreateNewDeviceCommand): Promise<void> {
    const { refreshToken, userId, ip, title } = command;
    const payloadToken = this.jwtQueryRepository.getPayloadToken(refreshToken);
    if (!payloadToken) {
      throw new UnauthorizedException();
    }
    const device = new Device();
    device.ip = ip;
    device.title = title;
    device.userId = userId;
    device.deviceId = payloadToken.deviceId;
    device.lastActiveDate = new Date(payloadToken.iat! * 1000).toISOString();
    device.expirationDate = payloadToken.exp! - payloadToken.iat!;

    await this.deviceRepository.save(device);
    return;
  }
}
