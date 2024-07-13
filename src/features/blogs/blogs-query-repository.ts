import { Injectable } from '@nestjs/common';
import { BlogQueryModel } from './models/input/blog.input.model';
import { getQueryParams } from '../../infrastructure/utils/getQueryParams';
import { BlogViewType } from './models/output/blog.output.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogDBType } from './types';
import { convertBlogToViewModel } from './features/blogs.functions.helpers';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getAllBlogs(query: BlogQueryModel) {
    const paramsOfElems = getQueryParams(query);

    const res = await this.dataSource.query(
      `
      SELECT 
        b.* 
      FROM public.blog as b
      WHERE 
        (LOWER(b.name) like LOWER($1) OR $1 IS NULL)
      ORDER BY b."${query.sortBy || 'createdAt'}" ${
        query.sortDirection === 'asc' ? 'ASC' : 'DESC'
      }
      LIMIT $2 OFFSET $3;
    `,
      [
        query.searchNameTerm ? `%${query.searchNameTerm}%` : null,
        paramsOfElems.pageSize,
        (paramsOfElems.pageNumber - 1) * paramsOfElems.pageSize,
      ],
    );
    const countResponse = await this.dataSource.query(
      `
      SELECT COUNT(*) as count
      FROM public.blog as b
      WHERE       
        (LOWER(b.name) like LOWER($1) OR $1 IS NULL)
    `,
      [query.searchNameTerm ? `%${query.searchNameTerm}%` : null],
    );

    return {
      pagesCount: Math.ceil(+countResponse[0].count / paramsOfElems.pageSize),
      page: paramsOfElems.pageNumber,
      pageSize: paramsOfElems.pageSize,
      totalCount: +countResponse[0].count,
      items: res.map((b: BlogDBType) => convertBlogToViewModel(b)),
    };
  }

  async getBlogById(id: string): Promise<BlogViewType | null> {
    const res = await this.dataSource.query(
      `
      SELECT 
      b.* 
      FROM public.blog as b
      WHERE $1 = b."id"
    `,
      [id],
    );
    return !!res.length ? convertBlogToViewModel(res[0]) : null;
  }
}
