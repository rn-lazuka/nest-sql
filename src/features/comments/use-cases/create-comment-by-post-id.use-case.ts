import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../comments.repository';
import { CommentViewType } from '../models/output/comment.output.model';
import { LikeStatus } from '../../../infrastructure/helpers/enums/like-status';
import { UsersQueryRepository } from '../../users/users.query-repository';
import { Comment } from '../domain/comment.schema';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Post } from '../../posts/domain/post.schema';

export class CreateCommentByPostIdCommand {
  constructor(
    public content: string,
    public userId: string,
    public postId: string,
  ) {}
}

@CommandHandler(CreateCommentByPostIdCommand)
export class CreateCommentByPostIdUseCase
  implements ICommandHandler<CreateCommentByPostIdCommand>
{
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    protected usersQueryRepository: UsersQueryRepository,
    protected commentsRepository: CommentsRepository,
  ) {}

  async execute(
    command: CreateCommentByPostIdCommand,
  ): Promise<null | CommentViewType> {
    const { content, userId, postId } = command;
    const user = await this.usersQueryRepository.getUserById(userId);
    if (!user) {
      return null;
    }

    const post = await this.entityManager.findOneBy(Post, { id: postId });
    if (!post) {
      return null;
    }

    const comment = new Comment();
    comment.content = content;
    comment.postId = postId;
    comment.userId = userId;

    const createdComment = await this.commentsRepository.save(comment);

    return {
      id: createdComment.id,
      createdAt: createdComment.createdAt,
      content: createdComment.content,
      commentatorInfo: {
        userId,
        userLogin: user.login,
      },
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
      },
    };
  }
}
