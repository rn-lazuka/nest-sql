import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../posts-repository';
import { LikeStatus } from '../../../infrastructure/helpers/enums/like-status';
import { PostsQueryRepository } from '../posts-query-repository';
import { UsersQueryRepository } from '../../users/users.query-repository';
import { PostLike } from '../domain/post-like.schema';

export class UpdatePostLikeStatusCommand {
  constructor(
    public postId: string,
    public userId: string,
    public likeStatus: LikeStatus,
  ) {}
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusUseCase
  implements ICommandHandler<UpdatePostLikeStatusCommand>
{
  constructor(
    protected commandBus: CommandBus,
    protected usersQueryRepository: UsersQueryRepository,
    protected postsQueryRepository: PostsQueryRepository,
    protected postsRepository: PostsRepository,
  ) {}

  async execute(command: UpdatePostLikeStatusCommand): Promise<boolean> {
    const { userId, postId, likeStatus } = command;
    const post = await this.postsQueryRepository.getPostById(postId, userId);
    if (!post) {
      return false;
    }

    const user = await this.usersQueryRepository.getUserById(userId);
    if (!user) {
      return false;
    }
    let postLikeInfo = await this.postsQueryRepository.getPostLikeInfo(postId);

    if (!postLikeInfo) {
      postLikeInfo = new PostLike();
      postLikeInfo.login = user.login;
      postLikeInfo.postId = postId;
      postLikeInfo.userId = userId;
    }
    postLikeInfo.likeStatus = likeStatus;

    await this.postsRepository.savePostLikeInfo(postLikeInfo);

    return true;
  }
}
