import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Post, PostModelType } from '../posts/postSchema';
import { Blog, BlogModelType } from '../blogs/blogSchema';
import { Comment, CommentModelType } from '../comments/commentSchema';
import {
  CommentLikesInfo,
  CommentLikesInfoModelType,
} from '../likes-info/domain/comment-likes-info.schema';
import {
  PostLikesInfo,
  PostLikesInfoModelType,
} from '../likes-info/domain/post-likes-info.schema';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class TestsRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    @InjectModel(CommentLikesInfo.name)
    private CommentLikesInfoModel: CommentLikesInfoModelType,
    @InjectModel(PostLikesInfo.name)
    private PostLikesInfoModel: PostLikesInfoModelType,
  ) {}

  async deleteAllData(): Promise<void> {
    await this.dataSource.query(`
    BEGIN;
    TRUNCATE TABLE public.users RESTART IDENTITY CASCADE;
    TRUNCATE TABLE public.devices;
    TRUNCATE TABLE public.tokens;
    TRUNCATE TABLE public."emailConfirmation";
    TRUNCATE TABLE public."passwordRecovery";
    COMMIT;
    `);

    Promise.all([
      this.PostModel.deleteMany({}),
      this.BlogModel.deleteMany({}),
      this.CommentModel.deleteMany({}),
      this.CommentLikesInfoModel.deleteMany({}),
      this.PostLikesInfoModel.deleteMany({}),
    ]).then(
      (value) => {
        console.log('OK');
      },
      (reason) => {
        console.log(reason);
      },
    );
  }
}
