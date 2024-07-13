import { Injectable } from '@nestjs/common';
import { Comment } from './domain/comment.schema';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { CommentLike } from './domain/comment-like.schema';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  async getCommentInstance(commentId: string): Promise<Comment | null> {
    return await this.entityManager
      .getRepository(Comment)
      .findOneBy({ id: commentId });
  }

  async save(comment: Comment): Promise<Comment> {
    return await this.entityManager.save(Comment, comment);
  }

  async saveCommentLikeInfo(
    commentLikeInfo: CommentLike,
  ): Promise<CommentLike> {
    return await this.entityManager.save(CommentLike, commentLikeInfo);
  }

  async deleteComment(id: string): Promise<boolean> {
    const res = await this.entityManager.delete(Comment, { id });
    return !!res.affected;
  }
}
