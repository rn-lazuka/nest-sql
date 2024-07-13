import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { BlogsRepository } from './blogs-repository';
import {
  BlogQueryModel,
  CreateBlogModel,
  UpdateBlogModel,
} from './models/input/blog.input.model';
import {
  BlogPaginationType,
  BlogViewType,
} from './models/output/blog.output.model';
import { Response } from 'express';
import { HTTP_STATUS_CODE } from '../../infrastructure/helpers/enums/http-status';
import {
  PostsPaginationType,
  PostViewType,
} from '../posts/models/output/post.output.model';
import {
  PostCreateFromBlogModel,
  PostCreateModel,
  PostUpdateFromBlogModel,
} from '../posts/models/input/post.input.model';
import { PostsQueryRepository } from '../posts/posts-query-repository';
import { BasicAuthGuard } from '../../infrastructure/guards/basic-auth.guard';
import { CurrentUserId } from '../../infrastructure/decorators/auth/current-user-id.param.decorator';
import { BlogsQueryRepository } from './blogs-query-repository';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from './use-cases/create-blog.use-case';
import { UpdateBlogCommand } from './use-cases/update-blog.use-case';
import { CreatePostCommand } from '../posts/use-cases/create-post.use-case';
import { UpdatePostForBlogCommand } from './use-cases/update-post-for-blog.use-case';
import { DeletePostForBlogCommand } from './use-cases/delete-post-for-blog.use-case';

@Controller('/sa/blogs')
export class BlogsSaController {
  constructor(
    protected commandBus: CommandBus,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected blogsRepository: BlogsRepository,
    protected postsQueryRepository: PostsQueryRepository,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  async getAllBlogs(
    @Query() query: BlogQueryModel,
    @Res() res: Response<BlogPaginationType>,
  ) {
    try {
      const result = await this.blogsQueryRepository.getAllBlogs(query);
      res.status(HTTP_STATUS_CODE.OK_200).send(result);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(
        `Something was wrong. Error: ${err}`,
      );
    }
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createBlog(
    @Body() createBlogModel: CreateBlogModel,
    @Res() res: Response<BlogViewType | string>,
  ) {
    try {
      const result = await this.commandBus.execute(
        new CreateBlogCommand(createBlogModel),
      );
      res.status(HTTP_STATUS_CODE.CREATED_201).send(result);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(
        `Something was wrong. Error: ${err}`,
      );
    }
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  async updateBlog(
    @Param('id') blogId: string,
    @Body() dataForUpdate: UpdateBlogModel,
    @Res() res: Response<void>,
  ) {
    const result = await this.commandBus.execute(
      new UpdateBlogCommand(blogId, dataForUpdate),
    );
    res.sendStatus(
      result ? HTTP_STATUS_CODE.NO_CONTENT_204 : HTTP_STATUS_CODE.NOT_FOUND_404,
    );
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  async deleteBlog(@Param('id') blogId: string, @Res() res: Response<void>) {
    try {
      const isDeleted = await this.blogsRepository.deleteBlog(blogId);
      res.sendStatus(
        isDeleted
          ? HTTP_STATUS_CODE.NO_CONTENT_204
          : HTTP_STATUS_CODE.NOT_FOUND_404,
      );
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(
        `Something was wrong. Error: ${err}`,
      );
    }
  }

  @UseGuards(BasicAuthGuard)
  @Post(`:blogId/posts`)
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @Body() inputPostModel: PostCreateFromBlogModel,
    @Res() res: Response<PostViewType>,
  ) {
    const postData: PostCreateModel = { blogId, ...inputPostModel };
    const result = await this.commandBus.execute(
      new CreatePostCommand(postData),
    );
    result
      ? res.status(HTTP_STATUS_CODE.CREATED_201).send(result)
      : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
  }

  @UseGuards(BasicAuthGuard)
  @Get(':blogId/posts')
  async getAllPostsOfBlog(
    @Param('blogId') blogId: string,
    @CurrentUserId() userId: string | null,
    @Query() query: BlogQueryModel,
    @Res() res: Response<PostsPaginationType>,
  ) {
    const result = await this.postsQueryRepository.getAllPostsForBlog(
      blogId,
      query,
      userId,
    );
    result
      ? res.status(HTTP_STATUS_CODE.OK_200).send(result)
      : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
  }

  @UseGuards(BasicAuthGuard)
  @Put(':blogId/posts/:postId')
  async updatePostForBlog(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() dataForUpdate: PostUpdateFromBlogModel,
    @Res() res: Response<void>,
  ) {
    await this.commandBus.execute(
      new UpdatePostForBlogCommand(blogId, postId, dataForUpdate),
    );
    res.sendStatus(HTTP_STATUS_CODE.NO_CONTENT_204);
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':blogId/posts/:postId')
  async deletePostForBlog(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Res() res: Response<void>,
  ) {
    await this.commandBus.execute(new DeletePostForBlogCommand(blogId, postId));
    res.sendStatus(HTTP_STATUS_CODE.NO_CONTENT_204);
  }
}
