import {
  Column,
  CreateDateColumn,
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
  @CreateDateColumn({ type: 'timestamp' })
  addedAt: Date;
  @Column({ type: 'enum', enum: LikeStatus, default: LikeStatus.None })
  likeStatus: LikeStatus;
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
