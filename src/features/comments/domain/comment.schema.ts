import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommentLike } from './comment-like.schema';
import { Post } from '../../posts/domain/post.schema';
import { User } from '../../users/domain/user.schema';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  content: string;
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @Column()
  postId: string;
  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @OneToMany(() => CommentLike, (cl) => cl.comment)
  @JoinColumn()
  likesInfo: CommentLike[];

  @ManyToOne(() => Post)
  @JoinColumn()
  post: Post;
}
