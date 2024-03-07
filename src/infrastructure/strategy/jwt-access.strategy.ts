import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersQueryRepository } from '../../features/users/users.query-repository';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(protected usersQueryRepository: UsersQueryRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.PRIVATE_KEY_ACCESS_TOKEN,
    });
  }

  async validate(payload: any) {
    const user = this.usersQueryRepository.getUserById(payload.userId);
    if (!user) throw new UnauthorizedException();

    return { id: payload.userId };
  }
}
