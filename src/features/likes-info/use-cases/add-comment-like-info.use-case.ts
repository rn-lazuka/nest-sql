import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatus } from '../../../infrastructure/helpers/enums/like-status';

export class AddCommentLikeInfoCommand {
  constructor(
    public userId: string,
    public commentId: string,
    public likeStatus: LikeStatus,
  ) {}
}

@CommandHandler(AddCommentLikeInfoCommand)
export class AddCommentLikeInfoUseCase
  implements ICommandHandler<AddCommentLikeInfoCommand>
{
  constructor() {} //todo add comment repo

  async execute(command: AddCommentLikeInfoCommand): Promise<void> {
    const { userId, commentId, likeStatus } = command;
    //todo add comment like
    return;
  }
}
