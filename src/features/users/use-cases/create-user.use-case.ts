import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserInputModel } from '../models/input/create-user.input.model';
import { UserViewType } from '../models/output/user.output.model';
import { UsersRepository } from '../users-repository';
import { CryptoAdapter } from '../../../infrastructure/adapters/crypto.adapter';
import { convertUserToViewModel } from '../features/users.functions.helpers';
import { User } from '../domain/user.schema';
import { UserEmailConfirmation } from '../domain/user-email-confirmation.schema';
import { UserPasswordRecovery } from '../domain/user-password-recovery.schema';

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
    const newUser = new User();
    newUser.email = inputBodyUser.email;
    newUser.login = inputBodyUser.login;
    newUser.passwordHash = passwordHash;

    const createdUser = await this.usersRepository.createUser(newUser);
    const emailConfirmationData = new UserEmailConfirmation();
    emailConfirmationData.userId = createdUser.id;
    emailConfirmationData.isConfirmed = true;
    await this.usersRepository.saveUserEmailConfirmationData(
      emailConfirmationData,
    );
    return convertUserToViewModel(createdUser as User);
  }
}
