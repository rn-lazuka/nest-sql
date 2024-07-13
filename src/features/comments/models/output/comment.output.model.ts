import { LikeStatus } from '../../../../infrastructure/helpers/enums/like-status';

export type CommentLikeInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
};

export type CommentViewType = {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  likesInfo: CommentLikeInfo;
  createdAt: string;
};

export type CommentsPaginationType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<CommentViewType>;
};
