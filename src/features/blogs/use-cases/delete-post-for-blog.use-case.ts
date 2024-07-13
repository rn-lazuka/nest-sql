import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../posts/posts-repository';
import { BlogsQueryRepository } from '../blogs-query-repository';
import { PostsQueryRepository } from '../../posts/posts-query-repository';
import { NotFoundException } from '@nestjs/common';

export class DeletePostForBlogCommand {
  constructor(
    public blogId: string,
    public postId: string,
  ) {}
}

@CommandHandler(DeletePostForBlogCommand)
export class DeletePostForBlogUseCase
  implements ICommandHandler<DeletePostForBlogCommand>
{
  constructor(
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsQueryRepository: PostsQueryRepository,
    protected postsRepository: PostsRepository,
  ) {}

  async execute(command: DeletePostForBlogCommand): Promise<void> {
    const { blogId, postId } = command;
    const blog = await this.blogsQueryRepository.getBlogById(blogId);
    const post = await this.postsQueryRepository.getPostById(postId, null);
    if (!blog || !post) {
      throw new NotFoundException('No such post or blog');
    }
    await this.postsRepository.deletePost(postId);
  }
}
