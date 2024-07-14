import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { Comment } from './comment.schema';
import { LikeStatus } from '../../../infrastructure/helpers/enums/like-status';
import { User } from '../../users/domain/user.schema';

@Entity()
export class CommentLike {
  @Column({ type: 'enum', enum: LikeStatus, default: LikeStatus.None })
  likeStatus: LikeStatus;
  @PrimaryColumn()
  commentId: string;
  @PrimaryColumn()
  userId: string;

  @ManyToOne(() => Comment)
  @JoinColumn()
  comment: Comment;
  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
