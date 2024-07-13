import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostCreateModel } from '../models/input/post.input.model';
import { PostsRepository } from '../posts-repository';
import { BadRequestException } from '@nestjs/common';
import { BlogsQueryRepository } from '../../blogs/blogs-query-repository';
import { PostsQueryRepository } from '../posts-query-repository';

export class UpdatePostCommand {
  constructor(
    public postId: string,
    public inputBodyPost: PostCreateModel,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsRepository: PostsRepository,
    protected postsQueryRepository: PostsQueryRepository,
  ) {}

  async execute(command: UpdatePostCommand): Promise<boolean> {
    const { postId, inputBodyPost } = command;
    const blog = await this.blogsQueryRepository.getBlogById(
      inputBodyPost.blogId,
    );

    if (!blog) {
      throw new BadRequestException([
        {
          message: 'Such blogId is not found',
          field: 'blogId',
        },
      ]);
    }

    const post = await this.postsQueryRepository.getPostById(postId, null);
    if (!post) return false;

    await this.postsRepository.updatePostInfo(postId, inputBodyPost);

    return true;
  }
}
