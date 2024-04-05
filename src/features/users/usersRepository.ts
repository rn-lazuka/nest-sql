import { Injectable } from '@nestjs/common';
import { EmailConfirmationInfo, UserDBType } from './types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateUserModel } from './models/input/user.input.model';

@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async saveUserData(user: CreateUserModel): Promise<UserDBType> {
    const res = await this.dataSource.query(
      `
      INSERT INTO public.users(
      login, email, "passwordHash")
      VALUES ($1,$2,$3)
      RETURNING id, login, email;
    `,
      [user.login, user.email, user.passwordHash],
    );

    await this.dataSource.query(
      `
      INSERT INTO public."passwordRecovery"("userId")
      VALUES ($1);
    `,
      [res[0].id],
    );
    return res[0];
  }
  async saveUserConfirmationData(
    userId: string,
    data: Partial<EmailConfirmationInfo>,
  ): Promise<EmailConfirmationInfo> {
    const res = await this.dataSource.query(
      `
      INSERT INTO public."emailConfirmation"("userId", "confirmationCode", "expirationDate", "isConfirmed")
      VALUES ($1,$2,$3,$4)
      RETURNING "userId", "confirmationCode", "expirationDate", "isConfirmed"
    `,
      [userId, data.confirmationCode, data.expirationDate, data.isConfirmed],
    );
    return res[0];
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
    const res = await this.dataSource.query(
      `
      DELETE FROM public.users as u
      WHERE u.id=$1;
    `,
      [id],
    );
    return !res[0];
  }
}
