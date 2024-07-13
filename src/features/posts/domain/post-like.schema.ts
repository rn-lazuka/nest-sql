import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { Post } from './post.schema';
import { LikeStatus } from '../../../infrastructure/helpers/enums/like-status';
import { User } from '../../users/domain/user.schema';

@Entity()
export class PostLike {
  @Column({ default: new Date().toISOString() })
  addedAt: string;
  @Column({ type: 'enum', enum: LikeStatus, default: LikeStatus.None })
  likeStatus: string;
  @Column()
  login: string;
  @PrimaryColumn()
  postId: string;
  @PrimaryColumn()
  userId: string;

  @ManyToOne(() => Post)
  @JoinColumn()
  post: Post;
  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
