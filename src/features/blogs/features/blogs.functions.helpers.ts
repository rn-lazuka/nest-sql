import { BlogDBType } from '../types';
import { BlogViewType } from '../models/output/blog.output.model';

export const convertBlogToViewModel = (blog: BlogDBType): BlogViewType => {
  return {
    id: blog.id,
    createdAt: blog.createdAt,
    name: blog.name,
    description: blog.description,
    isMembership: blog.isMembership,
    websiteUrl: blog.websiteUrl,
  };
};
