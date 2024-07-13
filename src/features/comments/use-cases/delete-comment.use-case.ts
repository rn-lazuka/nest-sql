import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { CommentsRepository } from '../comments.repository';
import { CommentsQueryRepository } from '../comments.query-repository';

export class DeleteCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(
    protected commentsQueryRepository: CommentsQueryRepository,
    protected commentsRepository: CommentsRepository,
  ) {}

  async execute(command: DeleteCommentCommand): Promise<boolean> {
    const { userId, commentId } = command;
    const comment = await this.commentsQueryRepository.getCommentById(
      commentId,
      userId,
    );
    if (!comment) return false;
    if (comment.commentatorInfo.userId !== userId) {
      throw new ForbiddenException();
    }
    return this.commentsRepository.deleteComment(commentId);
  }
}
