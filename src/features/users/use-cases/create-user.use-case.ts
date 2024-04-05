import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserInputModel } from '../models/input/create-user.input.model';
import { UserViewType } from '../models/output/user.output.model';
import { CreateUserModel } from '../models/input/user.input.model';
import { UsersRepository } from '../usersRepository';
import { CryptoAdapter } from '../../../infrastructure/adapters/crypto.adapter';
import { convertUserToViewModel } from '../features/users.functions.helpers';

export class CreateUserCommand {
  constructor(public inputBodyUser: CreateUserInputModel) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    protected usersRepository: UsersRepository,
    protected cryptoAdapter: CryptoAdapter,
  ) {}

  async execute(command: CreateUserCommand): Promise<UserViewType> {
    const { inputBodyUser } = command;
    const passwordHash = await this.cryptoAdapter.generateHash(
      inputBodyUser.password,
    );

    const userInfo: CreateUserModel = {
      email: inputBodyUser.email,
      login: inputBodyUser.login,
      passwordHash,
    };

    const createdUser = await this.usersRepository.saveUserData(userInfo);
    await this.usersRepository.saveUserConfirmationData(createdUser.id, {
      isConfirmed: true,
    });

    return convertUserToViewModel(createdUser);
  }
}
