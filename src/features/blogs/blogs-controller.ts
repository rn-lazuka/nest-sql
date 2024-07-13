import {
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { BlogsRepository } from './blogs-repository';
import { BlogQueryModel } from './models/input/blog.input.model';
import {
  BlogPaginationType,
  BlogViewType,
} from './models/output/blog.output.model';
import { Response } from 'express';
import { HTTP_STATUS_CODE } from '../../infrastructure/helpers/enums/http-status';
import { PostsPaginationType } from '../posts/models/output/post.output.model';
import { PostsQueryRepository } from '../posts/posts-query-repository';
import { JwtAccessNotStrictGuard } from '../../infrastructure/guards/jwt-access-not-strict.guard';
import { CurrentUserId } from '../../infrastructure/decorators/auth/current-user-id.param.decorator';
import { BlogsQueryRepository } from './blogs-query-repository';
import { CommandBus } from '@nestjs/cqrs';

@Controller('/blogs')
export class BlogsController {
  constructor(
    protected commandBus: CommandBus,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected blogsRepository: BlogsRepository,
    protected postsQueryRepository: PostsQueryRepository,
  ) {}

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

  @Get(':id')
  async getBlogById(
    @Param('id') blogId: string,
    @Res() res: Response<BlogViewType>,
  ) {
    const result = await this.blogsQueryRepository.getBlogById(blogId);
    result
      ? res.status(HTTP_STATUS_CODE.OK_200).send(result)
      : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
  }

  @UseGuards(JwtAccessNotStrictGuard)
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
}
