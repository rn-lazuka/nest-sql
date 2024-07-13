import { LikeStatus } from '../../infrastructure/helpers/enums/like-status';

export interface PostDBType {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  createdAt: string;
}

export interface PostDBFullData extends PostDBType {
  blogName: string;
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
}
