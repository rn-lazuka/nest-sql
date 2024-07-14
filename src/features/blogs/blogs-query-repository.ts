import { Injectable } from '@nestjs/common';
import { BlogQueryModel } from './models/input/blog.input.model';
import { getQueryParams } from '../../infrastructure/utils/getQueryParams';
import { BlogViewType } from './models/output/blog.output.model';
import { InjectDataSource, InjectEntityManager } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { convertBlogToViewModel } from './features/blogs.functions.helpers';
import { Blog } from './domain/blog.schema';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  async getAllBlogs(queryParams: BlogQueryModel) {
    const { pageNumber, pageSize, sortBy, sortDirection, skip } =
      getQueryParams(queryParams, 'createdAt', 'DESC');

    const query = this.entityManager
      .getRepository(Blog)
      .createQueryBuilder('b')
      .where('LOWER(b.name) like LOWER(:name) OR :name IS NULL', {
        name: queryParams.searchNameTerm
          ? `%${queryParams.searchNameTerm.toLowerCase()}%`
          : null,
      })
      .orderBy(`b.${sortBy}`, sortDirection)
      .addOrderBy(`b.name COLLATE "C"`, 'ASC');

    const [blogs, totalCount] = await query
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: blogs.map((b) => convertBlogToViewModel(b)),
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
