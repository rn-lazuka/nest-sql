import { Injectable } from '@nestjs/common';
import { UserDBType, UserFullData, UserQueryModel } from './types';
import {
  UsersPaginationType,
  UserViewType,
} from './models/output/user.output.model';
import { getQueryParams } from '../../infrastructure/utils/getQueryParams';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  convertUserToFullData,
  convertUserToViewModel,
} from './features/users.functions.helpers';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getAllUsers(query: UserQueryModel): Promise<UsersPaginationType> {
    const paramsOfElems = getQueryParams(query);
    const res = await this.dataSource.query(
      `
      SELECT 
        u.* 
      FROM public.users as u
      WHERE 
        (u.login = $1 OR $1 IS NULL) AND 
        (u.email = $2 OR $2 IS NULL)
      ORDER BY u.id ASC
      LIMIT $3 OFFSET $4;
    `,
      [
        query.searchLoginTerm,
        query.searchEmailTerm,
        paramsOfElems.pageSize,
        (paramsOfElems.pageNumber - 1) * paramsOfElems.pageSize,
      ],
    );
    const countResponse = await this.dataSource.query(
      `
      SELECT COUNT(*) as count
      FROM public.users as u
      WHERE $1 = u.login or $2 = u.email
    `,
      [query.searchLoginTerm, query.searchEmailTerm],
    );

    return {
      pagesCount: Math.ceil(+countResponse[0].count / paramsOfElems.pageSize),
      page: paramsOfElems.pageNumber,
      pageSize: paramsOfElems.pageSize,
      totalCount: +countResponse[0].count,
      items: res.map((p: UserDBType) => convertUserToViewModel(p)),
    };
  }

  async getUserById(id: string): Promise<UserViewType | null> {
    const res = await this.dataSource.query(
      `
      SELECT 
      u.* 
      FROM public.users as u
      WHERE $1 = u."id"
    `,
      [id],
    );
    return !!res.length ? convertUserToViewModel(res[0]) : null;
  }

  async getUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserFullData | null> {
    const res = await this.dataSource.query(
      `
      SELECT 
      u.*,
      ec."isConfirmed", 
      ec."confirmationCode" as "emailConfirmationCode", 
      ec."expirationDate" as "emailExpirationDate",
      pr."confirmationCode" as "recoveryConfirmationCode",
      pr."expirationDate" as "recoveryExpirationDate"
      FROM public.users as u
      LEFT JOIN public."emailConfirmation" as ec
      ON ec."userId" = u."id"
      LEFT JOIN public."passwordRecovery" as pr
      ON pr."userId" = u.id
      WHERE $1 in (u."email",u."login")
    `,
      [loginOrEmail],
    );
    return !!res.length ? convertUserToFullData(res[0]) : null;
  }

  async getUserByConfirmationCode(code: string): Promise<UserFullData | null> {
    const res = await this.dataSource.query(
      `
      SELECT 
      u.*,
      ec."confirmationCode" as "emailConfirmationCode", 
      ec."expirationDate" as "emailExpirationDate",
      pr."confirmationCode" as "recoveryConfirmationCode",
      pr."expirationDate" as "recoveryExpirationDate"
      FROM public.users as u
      LEFT JOIN public."emailConfirmation" as ec
      ON ec."userId" = u."id"
      LEFT JOIN public."passwordRecovery" as pr
      ON pr."userId" = u.id
      WHERE ec."confirmationCode" = $1
    `,
      [code],
    );

    return !!res.length ? convertUserToFullData(res[0]) : null;
  }

  async getUserByPasswordRecoveryCode(
    code: string,
  ): Promise<UserFullData | null> {
    const res = await this.dataSource.query(
      `
      SELECT 
      u.*,
      ec."confirmationCode" as "emailConfirmationCode", 
      ec."expirationDate" as "emailExpirationDate",
      pr."confirmationCode" as "recoveryConfirmationCode",
      pr."expirationDate" as "recoveryExpirationDate"
      FROM public.users as u
      LEFT JOIN public."emailConfirmation" as ec
      ON ec."userId" = u."id"
      LEFT JOIN public."passwordRecovery" as pr
      ON pr."userId" = u.id
      WHERE pr."confirmationCode" = $1
    `,
      [code],
    );

    return !!res.length ? convertUserToFullData(res[0]) : null;
  }
}
