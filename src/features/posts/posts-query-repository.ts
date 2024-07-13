import { Injectable } from '@nestjs/common';
import { LikeStatus } from '../../infrastructure/helpers/enums/like-status';
import { PostQueryModel } from './models/input/post.input.model';
import { getQueryParams } from '../../infrastructure/utils/getQueryParams';
import {
  PostsPaginationType,
  PostViewType,
} from './models/output/post.output.model';
import { BlogsQueryRepository } from '../blogs/blogs-query-repository';
import { InjectDataSource, InjectEntityManager } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { Post } from './domain/post.schema';
import { PostLike } from './domain/post-like.schema';
import { CommentQueryModel } from '../comments/models/input/comment.input.model';
import {
  CommentLikeInfo,
  CommentsPaginationType,
  CommentViewType,
} from '../comments/models/output/comment.output.model';
import { Comment } from '../comments/domain/comment.schema';
import { CommentLike } from '../comments/domain/comment-like.schema';
import { validate } from 'uuid';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    @InjectDataSource() protected dataSource: DataSource,
    protected blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async getPostLikeInfo(postId: string): Promise<PostLike | null> {
    return await this.entityManager
      .getRepository(PostLike)
      .createQueryBuilder('pl')
      .where('pl.postId = :postId', { postId })
      .getOne();
  }

  async getAllPosts(
    queryParams: PostQueryModel,
    userId: string | null,
  ): Promise<PostsPaginationType> {
    const { pageNumber, pageSize, sortBy, sortDirection, skip } =
      getQueryParams(queryParams);

    const query = this.entityManager
      .getRepository(Post)
      .createQueryBuilder('p')
      .orderBy(`p.${sortBy}`, sortDirection);

    const [posts, totalCount] = await query
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    const postsWithLikes = await Promise.all(
      posts.map(async (post) => {
        const likesInfo = await this.entityManager
          .getRepository(PostLike)
          .createQueryBuilder('pl')
          .select(
            'COALESCE(COUNT(CASE WHEN pl.likeStatus = :likeStatus THEN 1 ELSE NULL END), 0) AS "likesCount"',
          )
          .addSelect(
            'COALESCE(COUNT(CASE WHEN pl.likeStatus = :dislikeStatus THEN 1 ELSE NULL END), 0) AS "dislikesCount"',
          )
          .addSelect(
            'COALESCE(MAX(CASE WHEN pl.userId = :userId THEN pl.likeStatus ELSE :noneStatus END), :noneStatus) AS "myStatus"',
          )
          .where('pl.postId = :id', {
            id: post.id,
            likeStatus: LikeStatus.Like,
            dislikeStatus: LikeStatus.Dislike,
            userId,
            noneStatus: LikeStatus.None,
          })
          .getRawOne();

        const newestLikes = await this.entityManager
          .getRepository(PostLike)
          .createQueryBuilder('pl')
          .select(['pl.addedAt', 'pl.login', 'pl.userId'])
          .where('pl.postId = :id', { id: post.id })
          .andWhere('pl.likeStatus = :likeStatus', {
            likeStatus: LikeStatus.Like,
          })
          .orderBy('pl.addedAt', 'DESC')
          .take(3)
          .getMany();

        return { ...post, extendedLikesInfo: { ...likesInfo, newestLikes } };
      }),
    );

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: postsWithLikes,
    };
  }

  async getPostById(
    id: string,
    userId: string | null,
  ): Promise<PostViewType | null> {
    if (!validate(id)) {
      return null; // Вернуть null, если id не является допустимым UUID
    }

    const post = await this.entityManager
      .getRepository(Post)
      .createQueryBuilder('p')
      .where('p.id = :id', { id })
      .getOne();

    if (!post) return null;

    const likesInfo = await this.entityManager
      .getRepository(PostLike)
      .createQueryBuilder('pl')
      .select(
        'COALESCE(COUNT(CASE WHEN pl.likeStatus = :likeStatus THEN 1 ELSE NULL END), 0) AS "likesCount"',
      )
      .addSelect(
        'COALESCE(COUNT(CASE WHEN pl.likeStatus = :dislikeStatus THEN 1 ELSE NULL END), 0) AS "dislikesCount"',
      )
      .addSelect(
        'COALESCE(MAX(CASE WHEN pl.userId = :userId THEN pl.likeStatus ELSE :noneStatus END), :noneStatus) AS "myStatus"',
      )
      .where('pl.postId = :id', {
        id,
        likeStatus: LikeStatus.Like,
        dislikeStatus: LikeStatus.Dislike,
        userId,
        noneStatus: LikeStatus.None,
      })
      .getRawOne();

    const newestLikes = await this.entityManager
      .getRepository(PostLike)
      .createQueryBuilder('pl')
      .select(['pl.addedAt', 'pl.login', 'pl.userId'])
      .where('pl.postId = :id', { id })
      .andWhere('pl.likeStatus = :likeStatus', { likeStatus: LikeStatus.Like })
      .orderBy('pl.addedAt', 'DESC')
      .take(3)
      .getMany();

    const extendedLikesInfo = { ...likesInfo, newestLikes } ?? {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: LikeStatus.None,
      newestLikes: [],
    };

    return { ...post, extendedLikesInfo };
  }

  async getAllPostsForBlog(
    blogId: string,
    queryParams: PostQueryModel,
    userId: string | null,
  ) {
    const blog = await this.blogsQueryRepository.getBlogById(blogId);
    if (!blog) {
      return null;
    }
    const { pageNumber, pageSize, sortBy, sortDirection, skip } =
      getQueryParams(queryParams);

    const query = this.entityManager
      .getRepository(Post)
      .createQueryBuilder('p')
      .where('p.blogId = :blogId', { blogId })
      .orderBy(`p.${sortBy}`, sortDirection);

    const [posts, totalCount] = await query
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    const postsWithLikes = await Promise.all(
      posts.map(async (post) => {
        const likesInfo = await this.entityManager
          .getRepository(PostLike)
          .createQueryBuilder('pl')
          .select(
            'COALESCE(COUNT(CASE WHEN pl.likeStatus = :likeStatus THEN 1 ELSE NULL END), 0) AS "likesCount"',
          )
          .addSelect(
            'COALESCE(COUNT(CASE WHEN pl.likeStatus = :dislikeStatus THEN 1 ELSE NULL END), 0) AS "dislikesCount"',
          )
          .addSelect(
            'COALESCE(MAX(CASE WHEN pl.userId = :userId THEN pl.likeStatus ELSE :noneStatus END), :noneStatus) AS "myStatus"',
          )
          .where('pl.postId = :id', {
            id: post.id,
            likeStatus: LikeStatus.Like,
            dislikeStatus: LikeStatus.Dislike,
            userId,
            noneStatus: LikeStatus.None,
          })
          .getRawOne();

        const newestLikes = await this.entityManager
          .getRepository(PostLike)
          .createQueryBuilder('pl')
          .select(['pl.addedAt', 'pl.login', 'pl.userId'])
          .where('pl.postId = :id', { id: post.id })
          .andWhere('pl.likeStatus = :likeStatus', {
            likeStatus: LikeStatus.Like,
          })
          .orderBy('pl.addedAt', 'DESC')
          .take(3)
          .getMany();

        return { ...post, extendedLikesInfo: { ...likesInfo, newestLikes } };
      }),
    );

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: postsWithLikes,
    };
  }

  async getCommentsByPostId(
    postId: string,
    queryParams: CommentQueryModel | PostQueryModel,
    userId: string | null,
  ): Promise<CommentsPaginationType | null> {
    const { pageNumber, pageSize, sortBy, sortDirection, skip } =
      getQueryParams(queryParams, 'createdAt', 'DESC');
    if (!validate(postId)) {
      return null; // Вернуть null, если id не является допустимым UUID
    }
    const post = this.getPostById(postId, null);
    if (!post) return null;

    const query = this.entityManager
      .getRepository(Comment)
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.user', 'u')
      .where('c.postId = :id', { id: postId })
      .orderBy(`c.${sortBy}`, sortDirection);

    const [comments, totalCount] = await query
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    const commentsWithLikes: CommentViewType[] = await Promise.all(
      comments.map(async (comment) => {
        let likesInfo: CommentLikeInfo | undefined = await this.entityManager
          .getRepository(CommentLike)
          .createQueryBuilder('cl')
          .addSelect(
            'COALESCE(COUNT(CASE WHEN cl.likeStatus = :likeStatus THEN 1 ELSE NULL END), 0) AS "likesCount"',
          )
          .addSelect(
            'COALESCE(COUNT(CASE WHEN cl.likeStatus = :dislikeStatus THEN 1 ELSE NULL END), 0) AS "dislikesCount"',
          )
          .addSelect(
            'COALESCE(MAX(CASE WHEN cl.userId = :userId THEN cl.likeStatus ELSE :noneStatus END), :noneStatus) AS "myStatus"',
          )
          .where('cl.commentId = :commentId', {
            commentId: comment.id,
            likeStatus: LikeStatus.Like,
            dislikeStatus: LikeStatus.Dislike,
            userId,
            noneStatus: LikeStatus.None,
          })
          .groupBy('cl.likeStatus, cl.userId, cl.commentId')
          .getRawOne();

        if (!likesInfo) {
          likesInfo = {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: LikeStatus.None,
          };
        }

        return {
          id: comment.id,
          createdAt: comment.createdAt,
          content: comment.content,
          commentatorInfo: {
            userId: comment.userId,
            userLogin: comment.user.login,
          },
          likesInfo,
        };
      }),
    );

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: commentsWithLikes,
    };
  }
}
