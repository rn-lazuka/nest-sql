import { BadRequestException, Injectable } from '@nestjs/common';
import { UserDBType, UserFullData, UserQueryModel } from './types';
import {
  UsersPaginationType,
  UserViewType,
} from './models/output/user.output.model';
import { getQueryParams } from '../../infrastructure/utils/getQueryParams';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  convertUserToFullData,
  convertUserToViewModel,
} from './features/users.functions.helpers';
import { User } from './domain/user.schema';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getAllUsers(query: UserQueryModel): Promise<UsersPaginationType> {
    const paramsOfElems = getQueryParams(query);

    const usersQuery = this.usersRepository
      .createQueryBuilder('u')
      .where('(LOWER(u.login) LIKE LOWER(:login) OR :login IS NULL)')
      .andWhere('(LOWER(u.email) LIKE LOWER(:email) OR :email IS NULL)')
      .orderBy(
        `u.${query.sortBy || 'createdAt'}`,
        query.sortDirection === 'asc' ? 'ASC' : 'DESC',
      )
      .skip((paramsOfElems.pageNumber - 1) * paramsOfElems.pageSize)
      .take(paramsOfElems.pageSize);

    query.searchLoginTerm
      ? usersQuery.setParameter('login', `%${query.searchLoginTerm}%`)
      : usersQuery.setParameter('login', null);
    query.searchEmailTerm
      ? usersQuery.setParameter('email', `%${query.searchEmailTerm}%`)
      : usersQuery.setParameter('email', null);

    const [users, count] = await usersQuery.getManyAndCount();

    return {
      pagesCount: Math.ceil(count / paramsOfElems.pageSize),
      page: paramsOfElems.pageNumber,
      pageSize: paramsOfElems.pageSize,
      totalCount: count,
      items: users.map((user: User) => convertUserToViewModel(user)),
    };
  }

  async getUserById(id: string): Promise<UserViewType | null> {
    const res = await this.usersRepository.findOneBy({ id });
    return !!res ? convertUserToViewModel(res) : null;
  }

  async getUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserFullData | null> {
    // const res = await this.usersRepository
    //   .createQueryBuilder()
    //   .where(':loginOrEmail in (login,email)')
    //   .select();
    const res = await this.dataSource.query(
      `
      SELECT
      u.*,
      ec."isConfirmed",
      ec."confirmationCode" as "emailConfirmationCode",
      ec."expirationDate" as "emailExpirationDate",
      pr."confirmationCode" as "recoveryConfirmationCode",
      pr."expirationDate" as "recoveryExpirationDate"
      FROM public.user as u
      LEFT JOIN public.user_email_confirmation as ec
      ON ec."userId" = u."id"
      LEFT JOIN public.user_password_recovery as pr
      ON pr."userId" = u.id
      WHERE $1 in (u."email",u."login")
    `,
      [loginOrEmail],
    );
    return !!res.length ? convertUserToFullData(res[0]) : null;
  }

  async getUserByConfirmationCode(code: string): Promise<UserFullData | null> {
    try {
      const res = await this.dataSource.query(
        `
      SELECT 
      u.*,
      ec."isConfirmed", 
      ec."confirmationCode" as "emailConfirmationCode", 
      ec."expirationDate" as "emailExpirationDate",
      pr."confirmationCode" as "recoveryConfirmationCode",
      pr."expirationDate" as "recoveryExpirationDate"
      FROM public.user as u
      LEFT JOIN public.user_email_confirmation as ec
      ON ec."userId" = u."id"
      LEFT JOIN public.user_password_recovery as pr
      ON pr."userId" = u.id
      WHERE ec."confirmationCode" = $1
    `,
        [code],
      );
      return !!res.length ? convertUserToFullData(res[0]) : null;
    } catch (e) {
      console.error(e);
      throw new BadRequestException([
        { message: 'Code is incorrect', field: 'code' },
      ]); //Code is incorrect
    }
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
      FROM public.user as u
      LEFT JOIN public.user_email_confirmation as ec
      ON ec."userId" = u."id"
      LEFT JOIN public.user_password_recovery as pr
      ON pr."userId" = u.id
      WHERE pr."confirmationCode" = $1
    `,
      [code],
    );

    return !!res.length ? convertUserToFullData(res[0]) : null;
  }
}
