import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatus } from '../../../infrastructure/helpers/enums/like-status';

export class UpdatePostLikeInfoCommand {
  constructor(
    public userId: string,
    public postId: string,
    public likeStatus: LikeStatus,
  ) {}
}

@CommandHandler(UpdatePostLikeInfoCommand)
export class UpdatePostLikeInfoUseCase
  implements ICommandHandler<UpdatePostLikeInfoCommand>
{
  constructor() {} //todo

  async execute(command: UpdatePostLikeInfoCommand): Promise<void> {
    const { userId, postId, likeStatus } = command;
    //todo update like info for post
  }
}
