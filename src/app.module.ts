import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersRepository } from './features/users/users-repository';
import * as process from 'process';
import { CommentsController } from './features/comments/comments.controller';
import { CommentsQueryRepository } from './features/comments/comments.query-repository';
import { BlogsController } from './features/blogs/blogs-controller';
import { PostsController } from './features/posts/posts-controller';
import { BlogsRepository } from './features/blogs/blogs-repository';
import { PostsRepository } from './features/posts/posts-repository';
import { TestsRepository } from './features/tests/testsRepository';
import { TestsController } from './features/tests/testsController';
import { AuthController } from './features/auth/api/auth.controller';
import { DevicesController } from './features/devices/api/devices.controller';
import { CommentsRepository } from './features/comments/comments.repository';
import { DevicesQueryRepository } from './features/devices/infrastructure/query.repository/devices.query.repository';
import { DevicesRepository } from './features/devices/infrastructure/repository/devices.repository';
import { PostsQueryRepository } from './features/posts/posts-query-repository';
import { UsersQueryRepository } from './features/users/users.query-repository';
import { JwtQueryRepository } from './features/jwt/jwt.query.repository';
import { IsBlogByIdExistsConstraint } from './infrastructure/decorators/posts/blog-id-exists.decorator';
import { LocalStrategy } from './infrastructure/strategy/local.strategy';
import { JwtRefreshStrategy } from './infrastructure/strategy/jwt-refresh.strategy';
import { JwtAccessStrategy } from './infrastructure/strategy/jwt-access.strategy';
import { BasicStrategy } from './infrastructure/strategy/basic.strategy';
import { EmailManager } from './infrastructure/managers/email-manager';
import { CryptoAdapter } from './infrastructure/adapters/crypto.adapter';
import { EmailAdapter } from './infrastructure/adapters/email.adapter';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';
import { ConfirmEmailUseCase } from './features/auth/use-cases/confirm-email.use-case';
import { LoginUserUseCase } from './features/auth/use-cases/login-user.use-case';
import { RegisterUserUseCase } from './features/auth/use-cases/register-user.use-case';
import { ResendConfirmationEmailMsgUseCase } from './features/auth/use-cases/resend-confirmation-email-message.use-case';
import { SendEmailPassRecoveryUseCase } from './features/auth/use-cases/send-email-pass-recovery.use-case';
import { SaveNewPasswordUseCase } from './features/auth/use-cases/save-new-password.use-case';
import { ValidateUserUseCase } from './features/auth/use-cases/validate-user.use-case';
import { BlogsQueryRepository } from './features/blogs/blogs-query-repository';
import { CreateBlogUseCase } from './features/blogs/use-cases/create-blog.use-case';
import { UpdateBlogUseCase } from './features/blogs/use-cases/update-blog.use-case';
import { UpdateCommentUseCase } from './features/comments/use-cases/update-comment.use-case';
import { DeleteCommentUseCase } from './features/comments/use-cases/delete-comment.use-case';
import { CreateCommentByPostIdUseCase } from './features/comments/use-cases/create-comment-by-post-id.use-case';
import { UpdateLikeStatusOfCommentUseCase } from './features/comments/use-cases/update-like-status-of-comment.use-case';
import { DeleteDeviceByRefreshTokenUseCase } from './features/devices/use-cases/delete-device-by-refresh-token.use-case';
import { CreateNewDeviceUseCase } from './features/devices/use-cases/create-new-device.use-case';
import { DeleteDevicesExcludeCurrentUseCase } from './features/devices/use-cases/delete-devices-exclude-current.use-case';
import { DeleteDeviceByIdUseCase } from './features/devices/use-cases/delete-device-by-id.use-case';
import { CreateRefreshJwtTokenUseCase } from './features/jwt/use-cases/create-refresh-jwt-token.use-case';
import { CreateAccessJwtTokenUseCase } from './features/jwt/use-cases/create-access-jwt-token.use-case';
import { ChangeTokenByRefreshTokenUseCase } from './features/jwt/use-cases/change-token-by-refresh-token.use-case';
import { AddCommentLikeInfoUseCase } from './features/likes-info/use-cases/add-comment-like-info.use-case';
import { AddPostLikeInfoUseCase } from './features/likes-info/use-cases/add-post-like-info.use-case';
import { UpdatePostLikeInfoUseCase } from './features/likes-info/use-cases/update-post-like-info.use-case';
import { UpdateCommentLikeInfoUseCase } from './features/likes-info/use-cases/update-comment-like-info.use-case';
import { CreatePostUseCase } from './features/posts/use-cases/create-post.use-case';
import { UpdatePostUseCase } from './features/posts/use-cases/update-post.use-case';
import { UpdatePostLikeStatusUseCase } from './features/posts/use-cases/update-post-like-status.use-case';
import { CreateUserUseCase } from './features/users/use-cases/create-user.use-case';
import { GetUserIdByAccessTokenUseCase } from './features/jwt/use-cases/getUserIdByAccessToken.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CheckIsTokenValidUseCase } from './features/jwt/use-cases/check-is-token-valid.use-case';
import { AuthRepository } from './features/auth/infrastructure/repository/auth.repository';
import { UsersSaController } from './features/users/users-sa-controller';
import { UpdatePostForBlogUseCase } from './features/blogs/use-cases/update-post-for-blog.use-case';
import { DeletePostForBlogUseCase } from './features/blogs/use-cases/delete-post-for-blog.use-case';
import { BlogsSaController } from './features/blogs/blogs-sa-controller';
import { RefreshToken } from './features/auth/domain/refresh-token.schema';
import { Device } from './features/devices/domain/device.schema';
import { User } from './features/users/domain/user.schema';
import { UserEmailConfirmation } from './features/users/domain/user-email-confirmation.schema';
import { UserPasswordRecovery } from './features/users/domain/user-password-recovery.schema';
import { Blog } from './features/blogs/domain/blog.schema';
import { PostLike } from './features/posts/domain/post-like.schema';
import { Post } from './features/posts/domain/post.schema';
import { Comment } from './features/comments/domain/comment.schema';
import { CommentLike } from './features/comments/domain/comment-like.schema';

const features = [
  RefreshToken,
  Device,
  User,
  UserEmailConfirmation,
  UserPasswordRecovery,
  Blog,
  Post,
  PostLike,
  Comment,
  CommentLike,
];

const queryRepositories = [
  CommentsQueryRepository,
  DevicesQueryRepository,
  // LikesInfoQueryRepository,
  PostsQueryRepository,
  UsersQueryRepository,
  JwtQueryRepository,
  BlogsQueryRepository,
];
const repositories = [
  BlogsRepository,
  CommentsRepository,
  DevicesRepository,
  // LikesInfoRepository,
  PostsRepository,
  UsersRepository,
  AuthRepository,
  TestsRepository,
];

const handlers = [
  DeletePostForBlogUseCase,
  UpdatePostForBlogUseCase,
  ConfirmEmailUseCase,
  LoginUserUseCase,
  RegisterUserUseCase,
  ResendConfirmationEmailMsgUseCase,
  SendEmailPassRecoveryUseCase,
  SaveNewPasswordUseCase,
  ValidateUserUseCase,
  CreateBlogUseCase,
  UpdateBlogUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
  CreateCommentByPostIdUseCase,
  UpdateLikeStatusOfCommentUseCase,
  DeleteDeviceByRefreshTokenUseCase,
  CreateNewDeviceUseCase,
  DeleteDevicesExcludeCurrentUseCase,
  DeleteDeviceByIdUseCase,
  CreateRefreshJwtTokenUseCase,
  CreateAccessJwtTokenUseCase,
  ChangeTokenByRefreshTokenUseCase,
  AddCommentLikeInfoUseCase,
  AddPostLikeInfoUseCase,
  UpdatePostLikeInfoUseCase,
  UpdateCommentLikeInfoUseCase,
  CreatePostUseCase,
  UpdatePostUseCase,
  UpdatePostLikeStatusUseCase,
  CreateUserUseCase,
  GetUserIdByAccessTokenUseCase,
  CheckIsTokenValidUseCase,
];

export const dbOptions: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: process.env.POSTGRESQL_USERNAME,
  password: process.env.POSTGRESQL_PASSWORD,
  database: 'NestApp',
  autoLoadEntities: true,
  synchronize: true,
};

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(dbOptions),
    TypeOrmModule.forFeature([...features]),
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 5,
      },
    ]),
    CqrsModule,
    MongooseModule.forRoot(process.env.MONGO_URL!),
    JwtModule.register({}),
  ],
  controllers: [
    AuthController,
    BlogsController,
    BlogsSaController,
    DevicesController,
    PostsController,
    CommentsController,
    UsersSaController,
    TestsController,
  ],
  providers: [
    ...queryRepositories,
    ...repositories,

    //Constraints
    IsBlogByIdExistsConstraint,

    //Strategy
    LocalStrategy,
    JwtRefreshStrategy,
    JwtAccessStrategy,
    BasicStrategy,

    //Managers && Adapters
    EmailManager,
    CryptoAdapter,
    EmailAdapter,

    //handlers
    ...handlers,
  ],
})
export class AppModule {}
