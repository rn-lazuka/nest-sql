import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PostLike } from './post-like.schema';
import { Blog } from '../../blogs/domain/blog.schema';
import { Comment } from '../../comments/domain/comment.schema';

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  title: string;
  @Column()
  shortDescription: string;
  @Column()
  content: string;
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @Column()
  blogId: string;
  @Column()
  blogName: string;

  @OneToMany(() => PostLike, (pl) => pl.post)
  @JoinColumn()
  likesInfo: PostLike[];

  @OneToMany(() => Comment, (c) => c.post)
  @JoinColumn()
  comments: Comment[];

  @ManyToOne(() => Blog)
  @JoinColumn()
  blog: Blog;
}
