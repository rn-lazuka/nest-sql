export type UserQueryInputModel = {
  id: string;
  searchLoginTerm?: string;
  searchEmailTerm?: string;
  sortBy?: string;
  sortDirection?: string;
  pageNumber?: string | number;
  pageSize?: string | number;
  banStatus?: 'all' | 'banned' | 'notBanned';
};

export type CreateUserModel = {
  login: string;
  email: string;
  passwordHash: string;
};
