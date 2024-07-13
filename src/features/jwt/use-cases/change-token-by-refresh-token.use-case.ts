import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService as NestJwtService } from '@nestjs/jwt/dist/jwt.service';
import { AccessRefreshTokens } from '../jwt.types.service';
import { JwtQueryRepository } from '../jwt.query.repository';
import { DevicesRepository } from '../../devices/infrastructure/repository/devices.repository';
import { CheckIsTokenValidCommand } from './check-is-token-valid.use-case';
import { AuthRepository } from '../../auth/infrastructure/repository/auth.repository';
import { RefreshToken } from '../../auth/domain/refresh-token.schema';
import { DevicesQueryRepository } from '../../devices/infrastructure/query.repository/devices.query.repository';

export class ChangeTokenByRefreshTokenCommand {
  constructor(
    public userId: string,
    public cookieRefreshToken: string,
  ) {}
}

@CommandHandler(ChangeTokenByRefreshTokenCommand)
export class ChangeTokenByRefreshTokenUseCase
  implements ICommandHandler<ChangeTokenByRefreshTokenCommand>
{
  constructor(
    protected jwtServiceNest: NestJwtService,
    protected jwtQueryRepository: JwtQueryRepository,
    protected devicesRepository: DevicesRepository,
    protected devicesQueryRepository: DevicesQueryRepository,
    protected commandBus: CommandBus,
    private authRepository: AuthRepository,
  ) {}

  async execute(
    command: ChangeTokenByRefreshTokenCommand,
  ): Promise<AccessRefreshTokens> {
    const { userId, cookieRefreshToken } = command;
    const isTokenValid = await this.commandBus.execute(
      new CheckIsTokenValidCommand(cookieRefreshToken),
    );

    if (!isTokenValid) {
      throw new Error('Refresh token is invalid.');
    }
    const deactivatedRefreshToken = new RefreshToken();
    deactivatedRefreshToken.refreshToken = cookieRefreshToken;
    await this.authRepository.save(deactivatedRefreshToken);
    const accessToken = this.jwtServiceNest.sign(
      { userId },
      {
        secret: process.env.PRIVATE_KEY_ACCESS_TOKEN,
        expiresIn: process.env.EXPIRATION_TIME_ACCESS_TOKEN,
      },
    );
    const refreshToken = this.jwtServiceNest.sign(
      { userId, deviceId: isTokenValid.deviceId },
      {
        secret: process.env.PRIVATE_KEY_REFRESH_TOKEN,
        expiresIn: process.env.EXPIRATION_TIME_REFRESH_TOKEN,
      },
    );

    const payloadNewRefresh =
      this.jwtQueryRepository.getPayloadToken(refreshToken);
    if (!payloadNewRefresh?.iat) {
      throw new Error('Refresh token is invalid.');
    }
    const device = await this.devicesQueryRepository.getDeviceById(
      isTokenValid.deviceId,
    );
    if (!device) throw new Error('DeviceId in refresh token is invalid.');

    device.lastActiveDate = new Date(
      payloadNewRefresh.iat * 1000,
    ).toISOString();
    await this.devicesRepository.save(device);
    return {
      accessToken,
      refreshToken,
    };
  }
}
