export type UserQueryModel = {
  searchLoginTerm?: string;
  searchEmailTerm?: string;
  sortBy?: string;
  sortDirection?: string;
  pageNumber?: number;
  pageSize?: number;
};

export interface UserDBType {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  passwordHash: string;
}

export interface EmailConfirmationInfo {
  confirmationCode: string;
  expirationDate: Date;
  isConfirmed: boolean;
}

export interface PasswordRecoveryInfo {
  confirmationCode: string;
  expirationDate: Date;
}

export interface UserFullData extends UserDBType {
  emailConfirmation: EmailConfirmationInfo;
  passwordRecovery: PasswordRecoveryInfo;
}
export interface UserWithEmailInfo extends UserDBType {
  emailConfirmation: EmailConfirmationInfo;
}
export interface UserWithPasswordRecoveryInfo extends UserDBType {
  passwordRecovery: PasswordRecoveryInfo;
}
