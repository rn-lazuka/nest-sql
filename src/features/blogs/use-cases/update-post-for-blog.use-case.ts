import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostUpdateFromBlogModel } from '../../posts/models/input/post.input.model';
import { PostsRepository } from '../../posts/posts-repository';
import { BlogsQueryRepository } from '../blogs-query-repository';
import { PostsQueryRepository } from '../../posts/posts-query-repository';
import { NotFoundException } from '@nestjs/common';

export class UpdatePostForBlogCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public postBody: PostUpdateFromBlogModel,
  ) {}
}

@CommandHandler(UpdatePostForBlogCommand)
export class UpdatePostForBlogUseCase
  implements ICommandHandler<UpdatePostForBlogCommand>
{
  constructor(
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsQueryRepository: PostsQueryRepository,
    protected postsRepository: PostsRepository,
  ) {}

  async execute(command: UpdatePostForBlogCommand): Promise<void> {
    const { postBody, blogId, postId } = command;
    const blog = await this.blogsQueryRepository.getBlogById(blogId);
    const post = await this.postsQueryRepository.getPostById(postId, null);
    if (!blog || !post) {
      throw new NotFoundException('No such post or blog');
    }
    await this.postsRepository.updatePostInfo(postId, postBody);
  }
}
