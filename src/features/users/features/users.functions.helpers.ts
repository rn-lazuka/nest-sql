import { UserViewType } from '../models/output/user.output.model';
import { UserDBType, UserFullData } from '../types';

export const convertUserToViewModel = (
  user: UserDBType | UserFullData,
): UserViewType => {
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
