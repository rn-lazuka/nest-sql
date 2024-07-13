import { PostDBFullData } from '../types';
import { NewLike, PostViewType } from '../models/output/post.output.model';

export const convertPostToViewModel = (
  post: PostDBFullData,
  newestLikeInfo: NewLike[],
): PostViewType => {
  return {
    id: post.id,
    blogId: post.blogId,
    blogName: post.blogName,
    content: post.content,
    createdAt: post.createdAt,
    title: post.title,
    shortDescription: post.shortDescription,
    extendedLikesInfo: {
      newestLikes: newestLikeInfo,
      likesCount: 0,
      dislikesCount: 0,
      myStatus: post.myStatus,
    },
  };
};
