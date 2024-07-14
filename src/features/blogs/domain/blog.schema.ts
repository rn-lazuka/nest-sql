import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from '../../posts/domain/post.schema';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @Column()
  websiteUrl: string;
  @Column()
  name: string;
  @Column()
  description: string;
  @Column({ default: false })
  isMembership: boolean;

  @OneToMany(() => Post, (p) => p.blog)
  @JoinColumn()
  posts: Post[];
}
