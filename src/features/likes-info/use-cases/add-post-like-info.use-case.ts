import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatus } from '../../../infrastructure/helpers/enums/like-status';

export class AddPostLikeInfoCommand {
  constructor(
    public userId: string,
    public postId: string,
    public login: string,
    public likeStatus: LikeStatus,
  ) {}
}

@CommandHandler(AddPostLikeInfoCommand)
export class AddPostLikeInfoUseCase
  implements ICommandHandler<AddPostLikeInfoCommand>
{
  constructor() {} //todo ad post repo

  async execute(command: AddPostLikeInfoCommand): Promise<void> {
    const { userId, postId, likeStatus, login } = command;
    //todo add
    return;
  }
}
