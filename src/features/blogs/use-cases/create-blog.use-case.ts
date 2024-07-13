import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBlogModel } from '../models/input/blog.input.model';
import { BlogViewType } from '../models/output/blog.output.model';
import { BlogsRepository } from '../blogs-repository';
import { convertBlogToViewModel } from '../features/blogs.functions.helpers';

export class CreateBlogCommand {
  constructor(public createBlogModel: CreateBlogModel) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(protected blogsRepository: BlogsRepository) {}

  async execute(command: CreateBlogCommand): Promise<BlogViewType> {
    const { createBlogModel } = command;
    const blog = await this.blogsRepository.addBlog(createBlogModel);
    return convertBlogToViewModel(blog);
  }
}
