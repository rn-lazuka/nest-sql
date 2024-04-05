import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserModel } from '../../users/models/input/user.input.model';
import add from 'date-fns/add';
import { v4 as uuidv4 } from 'uuid';
import { CryptoAdapter } from '../../../infrastructure/adapters/crypto.adapter';
import { EmailManager } from '../../../infrastructure/managers/email-manager';
import { UsersRepository } from '../../users/usersRepository';

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
    const userInfo: CreateUserModel = {
      email,
      login,
      passwordHash,
    };

    const emailConfirmationData = {
      confirmationCode: uuidv4(),
      expirationDate: add(new Date(), { hours: 5, seconds: 20 }),
      isConfirmed: false,
    };

    const createdUser = await this.usersRepository.saveUserData(userInfo);
    const createdConfirmData =
      await this.usersRepository.saveUserConfirmationData(
        createdUser.id,
        emailConfirmationData,
      );
    await this.emailManager.sendEmailConfirmationCode(
      createdUser.email,
      createdConfirmData.confirmationCode,
    );

    return;
  }
}
