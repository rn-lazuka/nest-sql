import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../comments.repository';
import { LikeStatus } from '../../../infrastructure/helpers/enums/like-status';
import { UsersQueryRepository } from '../../users/users.query-repository';
import { CommentsQueryRepository } from '../comments.query-repository';
import { CommentLike } from '../domain/comment-like.schema';

export class UpdateLikeStatusOfCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
    public likeStatus: LikeStatus,
  ) {}
}

@CommandHandler(UpdateLikeStatusOfCommentCommand)
export class UpdateLikeStatusOfCommentUseCase
  implements ICommandHandler<UpdateLikeStatusOfCommentCommand>
{
  constructor(
    protected commandBus: CommandBus,
    protected usersQueryRepository: UsersQueryRepository,
    protected commentsRepository: CommentsRepository,
    protected commentsQueryRepository: CommentsQueryRepository,
  ) {}

  async execute(command: UpdateLikeStatusOfCommentCommand): Promise<boolean> {
    const { userId, commentId, likeStatus } = command;
    const comment = await this.commentsRepository.getCommentInstance(commentId);
    if (!comment) {
      return false;
    }
    const user = await this.usersQueryRepository.getUserById(userId);
    if (!user || user.id !== comment.userId) {
      return false;
    }
    let commentLikeInfo = await this.commentsQueryRepository.getCommentLikeInfo(
      commentId,
      userId,
    );

    if (!commentLikeInfo) {
      commentLikeInfo = new CommentLike();
      commentLikeInfo.commentId = commentId;
      commentLikeInfo.userId = userId;
    }
    commentLikeInfo.likeStatus = likeStatus;

    await this.commentsRepository.saveCommentLikeInfo(commentLikeInfo);
    return true;
  }
}
