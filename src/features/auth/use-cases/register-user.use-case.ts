import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CryptoAdapter } from '../../../infrastructure/adapters/crypto.adapter';
import { EmailManager } from '../../../infrastructure/managers/email-manager';
import { UsersRepository } from '../../users/users-repository';
import { User } from '../../users/domain/user.schema';
import { UserEmailConfirmation } from '../../users/domain/user-email-confirmation.schema';

export class RegisterUserCommand {
  constructor(
    public email: string,
    public login: string,
    public password: string,
  ) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase
  implements ICommandHandler<RegisterUserCommand>
{
  constructor(
    protected cryptoAdapter: CryptoAdapter,
    protected emailManager: EmailManager,
    protected usersRepository: UsersRepository,
  ) {}

  async execute(command: RegisterUserCommand): Promise<void> {
    const { email, login, password } = command;
    const passwordHash = await this.cryptoAdapter.generateHash(password);

    const newUser = new User();
    newUser.email = email;
    newUser.login = login;
    newUser.passwordHash = passwordHash;

    const createdUser = await this.usersRepository.createUser(newUser);
    const emailConfirmationData = new UserEmailConfirmation();

    emailConfirmationData.userId = createdUser.id;
    await this.usersRepository.saveUserEmailConfirmationData(
      emailConfirmationData,
    );

    await this.emailManager.sendEmailConfirmationCode(
      createdUser.email,
      emailConfirmationData.confirmationCode,
    );

    return;
  }
}
