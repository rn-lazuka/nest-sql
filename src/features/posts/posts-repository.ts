import { Injectable } from '@nestjs/common';
import { PostUpdateFromBlogModel } from './models/input/post.input.model';
import { PostDBType } from './types';
import { InjectDataSource, InjectEntityManager } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { PostLike } from './domain/post-like.schema';
import { Post } from './domain/post.schema';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  async savePost(post: Post): Promise<Post> {
    return await this.entityManager.save(Post, post);
  }

  async updatePostInfo(
    postId: string,
    data: PostUpdateFromBlogModel,
  ): Promise<null | PostDBType> {
    const res = await this.dataSource.query(
      `
    UPDATE public.post as p
    SET "title"=$2, "content"=$3, "shortDescription"=$4
    WHERE p.id = $1
    RETURNING p.*
    `,
      [postId, data.title, data.content, data.shortDescription],
    );

    return !!res[0] ? res[0] : null;
  }

  async savePostLikeInfo(postLikeInfo: PostLike): Promise<PostLike> {
    return await this.entityManager.save(PostLike, postLikeInfo);
  }

  async deletePost(id: string) {
    await this.dataSource.query(
      `
      DELETE FROM public.posts as p
      WHERE p.id = $1;
    `,
      [id],
    );
    return true;
  }
}
