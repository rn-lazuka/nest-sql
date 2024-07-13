import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostCreateModel } from '../models/input/post.input.model';
import { PostViewType } from '../models/output/post.output.model';
import { BlogsRepository } from '../../blogs/blogs-repository';
import { PostsRepository } from '../posts-repository';
import { updateNewestLikesInfo } from '../../likes-info/utils/updateNewestLikesInfo';
import { LikeStatus } from '../../../infrastructure/helpers/enums/like-status';
import { convertPostToViewModel } from '../features/posts.functions.helpers';
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
    post.blogName = blog.name;

    const createdPost = await this.postsRepository.savePost(post);

    // find last 3 Likes
    // const newestLikes =
    //   await this.likesInfoQueryRepository.getNewestLikesOfPost(post.id);
    //todo
    const updatedNewestLikes = updateNewestLikesInfo([]);
    const myStatus = LikeStatus.None;
    // return convertPostToViewModel({ ...createdPost, myStatus }, updatedNewestLikes);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    return createdPost as PostViewType;
  }
}
