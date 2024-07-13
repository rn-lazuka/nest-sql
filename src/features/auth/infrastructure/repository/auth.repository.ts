import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from '../../domain/refresh-token.schema';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async isRefreshTokenActive(refreshToken: string): Promise<boolean> {
    const res = await this.refreshTokenRepository.findOneBy({ refreshToken });
    return !res;
  }

  async save(deactivatedRefreshToken: RefreshToken): Promise<void> {
    await this.refreshTokenRepository.save(deactivatedRefreshToken);
  }
}
