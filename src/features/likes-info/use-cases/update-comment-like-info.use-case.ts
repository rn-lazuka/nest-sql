import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatus } from '../../../infrastructure/helpers/enums/like-status';

export class UpdateCommentLikeInfoCommand {
  constructor(
    public userId: string,
    public commentId: string,
    public likeStatus: LikeStatus,
  ) {}
}

@CommandHandler(UpdateCommentLikeInfoCommand)
export class UpdateCommentLikeInfoUseCase
  implements ICommandHandler<UpdateCommentLikeInfoCommand>
{
  constructor() {} //todo add repo

  async execute(command: UpdateCommentLikeInfoCommand): Promise<boolean> {
    const { userId, commentId, likeStatus } = command;
    //todo add comment like
    return true;
  }
}
