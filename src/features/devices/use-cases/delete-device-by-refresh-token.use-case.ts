import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../infrastructure/repository/devices.repository';
import { CheckIsTokenValidCommand } from '../../jwt/use-cases/check-is-token-valid.use-case';
import { RefreshToken } from '../../auth/domain/refreshToken.schema';
import { AuthRepository } from '../../auth/infrastructure/repository/auth.repository';
import { InjectModel } from '@nestjs/mongoose';

export class DeleteDeviceByRefreshTokenCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(DeleteDeviceByRefreshTokenCommand)
export class DeleteDeviceByRefreshTokenUseCase
  implements ICommandHandler<DeleteDeviceByRefreshTokenCommand>
{
  constructor(
    protected deviceRepository: DevicesRepository,
    protected commandBus: CommandBus,
    protected authRepository: AuthRepository,
  ) {}

  async execute(command: DeleteDeviceByRefreshTokenCommand): Promise<boolean> {
    const { refreshToken } = command;
    const isTokenValid = await this.commandBus.execute(
      new CheckIsTokenValidCommand(refreshToken),
    );
    if (!isTokenValid) {
      throw new Error('Refresh is invalid');
    }
    const isDeviceDeleted = await this.deviceRepository.deleteDeviceById(
      isTokenValid.deviceId,
    );
    if (isDeviceDeleted) {
      await this.authRepository.save(refreshToken);
      return true;
    }
    return false;
  }
}
