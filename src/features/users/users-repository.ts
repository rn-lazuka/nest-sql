import { Injectable, NotFoundException } from '@nestjs/common';
import { EmailConfirmationInfo } from './types';
import { InjectDataSource, InjectEntityManager } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { User } from './domain/user.schema';
import { UserEmailConfirmation } from './domain/user-email-confirmation.schema';
import { UserPasswordRecovery } from './domain/user-password-recovery.schema';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}
  async createUser(user: User): Promise<User> {
    const newUser = await this.entityManager.save(User, user);
    const passwordRecovery = new UserPasswordRecovery();
    passwordRecovery.userId = newUser.id;
    await this.entityManager.save(passwordRecovery);
    newUser.passwordRecovery = passwordRecovery;
    return newUser;
  }

  async save(user: User): Promise<User> {
    const res = await this.entityManager.save(User, user);
    return res;
  }

  async saveUserEmailConfirmationData(
    data: UserEmailConfirmation,
  ): Promise<UserEmailConfirmation> {
    const res = await this.entityManager.save(UserEmailConfirmation, data);
    return res;
  }

  async updateUserConfirmationData(id: string, data: EmailConfirmationInfo) {
    const res = await this.dataSource.query(
      `
    UPDATE public."emailConfirmation" as ec
    SET "confirmationCode"=$2, "expirationDate"=$3, "isConfirmed"=$4
    WHERE ec."userId" = $1
    RETURNING "isConfirmed","userId","confirmationCode","expirationDate";
    `,
      [id, data.confirmationCode, data.expirationDate, data.isConfirmed],
    );
    return !!res[0];
  }

  async updateUserConfirmationStatus(id: string) {
    const res = await this.dataSource.query(
      `
    UPDATE public."emailConfirmation" as ec
    SET "isConfirmed"=true
    WHERE ec."userId" = $1
    RETURNING "isConfirmed","userId","confirmationCode","expirationDate";
    `,
      [id],
    );
    return !!res[0];
  }

  async updatePassword(passwordHash: string, id: string): Promise<boolean> {
    const res = await this.dataSource.query(
      `
    UPDATE public.users as u
    SET "passwordHash"=$2
    WHERE u.id = $1
    RETURNING "passwordHash","id","login","email"
    `,
      [id, passwordHash],
    );
    return !!res[0];
  }

  async updatePasswordRecoveryCode(
    id: string,
    newCode: string,
    newDate: Date,
  ): Promise<boolean> {
    const res = await this.dataSource.query(
      `
    UPDATE public."passwordRecovery" as pr
    SET "confirmationCode"=$2, "expirationDate"=$3
    WHERE pr."userId" = $1
    RETURNING "userId","confirmationCode","expirationDate";
    `,
      [id, newCode, newDate],
    );
    return !!res[0];
  }

  async deleteUser(id: string) {
    try {
      const userExists = await this.dataSource.query(
        `
      SELECT u.*
      FROM public.user as u
      WHERE u.id = $1;
    `,
        [id],
      );

      if (!userExists.length) {
        throw new NotFoundException('User not found');
      }

      await this.dataSource.query(
        `
      DELETE FROM public.devices
      WHERE "userId" = $1;
    `,
        [id],
      );

      await this.dataSource.query(
        `
      DELETE FROM public."emailConfirmation"
      WHERE "userId" = $1;
    `,
        [id],
      );

      await this.dataSource.query(
        `
      DELETE FROM public."passwordRecovery"
      WHERE "userId" = $1;
    `,
        [id],
      );

      await this.dataSource.query(
        `
      DELETE FROM public.users
      WHERE id = $1;
    `,
        [id],
      );

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }
}
