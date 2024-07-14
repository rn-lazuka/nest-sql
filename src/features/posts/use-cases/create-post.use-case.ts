import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostCreateModel } from '../models/input/post.input.model';
import { PostViewType } from '../models/output/post.output.model';
import { BlogsRepository } from '../../blogs/blogs-repository';
import { PostsRepository } from '../posts-repository';
import { LikeStatus } from '../../../infrastructure/helpers/enums/like-status';
import { Post } from '../domain/post.schema';

export class CreatePostCommand {
  constructor(public createData: PostCreateModel) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected postsRepository: PostsRepository,
  ) {}

  async execute(command: CreatePostCommand): Promise<null | PostViewType> {
    const { createData } = command;
    const blog = await this.blogsRepository.getBlogInfo(createData.blogId);
    if (!blog) {
      return null;
    }
    const post = new Post();
    post.content = createData.content;
    post.title = createData.title;
    post.shortDescription = createData.shortDescription;
    post.blogId = createData.blogId;
    post.blogName = blog.name;

    const createdPost = await this.postsRepository.savePost(post);

    return {
      ...createdPost,
      extendedLikesInfo: {
        myStatus: LikeStatus.None,
        dislikesCount: 0,
        likesCount: 0,
        newestLikes: [],
      },
    };
  }
}
