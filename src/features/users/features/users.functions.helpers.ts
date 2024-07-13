import { UserViewType } from '../models/output/user.output.model';
import { UserFullData } from '../types';
import { User } from '../domain/user.schema';

export const convertUserToViewModel = (user: User): UserViewType => {
  return {
    id: user.id,
    createdAt: user.createdAt,
    email: user.email,
    login: user.login,
  };
};

export const convertUserToFullData = (user: any): UserFullData => {
  return {
    id: user.id,
    createdAt: user.createdAt,
    email: user.email,
    login: user.login,
    passwordHash: user.passwordHash,
    emailConfirmation: {
      isConfirmed: user.isConfirmed,
      confirmationCode: user.emailConfirmationCode,
      expirationDate: user.emailExpirationDate,
    },
    passwordRecovery: {
      confirmationCode: user.recoveryConfirmationCode,
      expirationDate: user.recoveryExpirationDate,
    },
  };
};
