import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AuthRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async isRefreshTokenActive(refreshToken: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    SELECT "refreshToken"
    FROM public.tokens
    WHERE "refreshToken" = $1
    `,
      [refreshToken],
    );

    return !result.length;
  }

  async save(deactivatedRefreshToken: string): Promise<void> {
    await this.dataSource.query(
      `
        INSERT INTO public.tokens("refreshToken")
        VALUES ($1);
    `,
      [deactivatedRefreshToken],
    );
    return;
  }
}
