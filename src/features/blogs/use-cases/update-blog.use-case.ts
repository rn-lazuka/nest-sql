import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBlogModel } from '../models/input/blog.input.model';
import { BlogsRepository } from '../blogs-repository';

export class UpdateBlogCommand {
  constructor(
    public id: string,
    public blogBody: UpdateBlogModel,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(protected blogsRepository: BlogsRepository) {}

  async execute(command: UpdateBlogCommand): Promise<boolean> {
    const { blogBody, id } = command;
    const blog = await this.blogsRepository.getBlogInfo(id);
    if (!blog) {
      return false;
    }

    await this.blogsRepository.updateBlogInfo(id, blogBody);

    return true;
  }
}
