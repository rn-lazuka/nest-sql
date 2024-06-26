import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../../users/users.query-repository';
import { ARTokensAndUserIdType } from '../application/dto/auth.dto.service';
import { CreateRefreshJwtTokenCommand } from '../../jwt/use-cases/create-refresh-jwt-token.use-case';
import { CreateAccessJwtTokenCommand } from '../../jwt/use-cases/create-access-jwt-token.use-case';
import { v4 as uuidv4 } from 'uuid';

export class LoginUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    protected usersQueryRepository: UsersQueryRepository,
    protected commandBus: CommandBus,
  ) {}

  async execute(
    command: LoginUserCommand,
  ): Promise<ARTokensAndUserIdType | null> {
    const { userId } = command;

    const user = await this.usersQueryRepository.getUserById(userId);
    if (!user) {
      return null;
    }
    const accessToken = await this.commandBus.execute(
      new CreateAccessJwtTokenCommand(userId),
    );
    const refreshToken = await this.commandBus.execute(
      new CreateRefreshJwtTokenCommand(userId, uuidv4()),
    );

    return {
      accessToken,
      refreshToken,
      userId,
    };
  }
}
