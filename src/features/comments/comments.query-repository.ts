import { Injectable } from '@nestjs/common';
import { Comment } from './domain/comment.schema';
import { LikeStatus } from '../../infrastructure/helpers/enums/like-status';
import { CommentQueryModel } from './models/input/comment.input.model';
import { getQueryParams } from '../../infrastructure/utils/getQueryParams';
import {
  CommentLikeInfo,
  CommentsPaginationType,
  CommentViewType,
} from './models/output/comment.output.model';
import { PostQueryModel } from '../posts/models/input/post.input.model';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { CommentLike } from './domain/comment-like.schema';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  async getCommentLikeInfo(commentId: string): Promise<CommentLike | null> {
    return await this.entityManager
      .getRepository(CommentLike)
      .createQueryBuilder('cl')
      .where('cl.commentId = :commentId', { commentId })
      .getOne();
  }

  async getCommentById(
    commentId: string,
    userId: string | null,
  ): Promise<CommentViewType | null> {
    const comment = await this.entityManager
      .getRepository(Comment)
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.user', 'u')
      .where('c.id = :id', { id: commentId })
      .getOne();

    if (!comment) return null;

    let likesInfo: CommentLikeInfo | undefined = await this.entityManager
      .getRepository(CommentLike)
      .createQueryBuilder('cl')
      .select(
        'COALESCE(CAST(COUNT(CASE WHEN cl.likeStatus = :likeStatus THEN 1 ELSE NULL END) AS INTEGER), 0) AS "likesCount"',
      )
      .addSelect(
        'COALESCE(CAST(COUNT(CASE WHEN cl.likeStatus = :dislikeStatus THEN 1 ELSE NULL END) AS INTEGER), 0) AS "dislikesCount"',
      )
      .addSelect(
        'COALESCE(MAX(CASE WHEN cl.userId = :userId THEN cl.likeStatus ELSE :noneStatus END), :noneStatus) AS "myStatus"',
      )
      .where('cl.commentId = :commentId', {
        commentId,
        likeStatus: LikeStatus.Like,
        dislikeStatus: LikeStatus.Dislike,
        userId,
        noneStatus: LikeStatus.None,
      })
      .getRawOne();

    if (!likesInfo) {
      likesInfo = {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
      };
    }
    return {
      id: comment.id,
      createdAt: comment.createdAt,
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.user.login,
      },
      likesInfo,
    };
  }
}
