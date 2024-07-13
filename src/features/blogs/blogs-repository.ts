import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogDBType } from './types';
import {
  CreateBlogModel,
  UpdateBlogModel,
} from './models/input/blog.input.model';

@Injectable()
export class BlogsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async addBlog(blog: CreateBlogModel): Promise<BlogDBType> {
    const res = await this.dataSource.query(
      `
      INSERT INTO public.blog(
      name, description, "websiteUrl")
      VALUES ($1,$2,$3)
      RETURNING id,name, description, "websiteUrl","createdAt","isMembership";
    `,
      [blog.name, blog.description, blog.websiteUrl],
    );

    return res[0];
  }

  async getBlogInfo(blogId: string): Promise<null | BlogDBType> {
    const res = await this.dataSource.query(
      `
      SELECT 
      b.* 
      FROM public.blog as b
      WHERE $1 = b.id
    `,
      [blogId],
    );
    return !!res.length ? res[0] : null;
  }

  async updateBlogInfo(blogId: string, data: UpdateBlogModel): Promise<void> {
    const res = await this.dataSource.query(
      `
    UPDATE public.blog as b
    SET "name"=$2, "description"=$3, "websiteUrl"=$4
    WHERE b.id = $1
    RETURNING b.*
    `,
      [blogId, data.name, data.description, data.websiteUrl],
    );
  }
  async deleteBlog(id: string): Promise<boolean> {
    const blogExists = await this.dataSource.query(
      `
      SELECT b.*
      FROM public.blog as b
      WHERE b.id = $1;
    `,
      [id],
    );
    if (!blogExists.length) {
      return false;
    }
    await this.dataSource.query(
      `
      DELETE FROM public.blog
      WHERE id = $1;
    `,
      [id],
    );
    return true;
  }
}
