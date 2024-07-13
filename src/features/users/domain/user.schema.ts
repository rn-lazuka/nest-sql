import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as process from 'process';
import { Device } from '../../devices/domain/device.schema';
import { UserEmailConfirmation } from './user-email-confirmation.schema';
import { UserPasswordRecovery } from './user-password-recovery.schema';
import { PostLike } from '../../posts/domain/post-like.schema';
import { Comment } from '../../comments/domain/comment.schema';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ unique: true })
  login: string;
  @Column({ unique: true })
  email: string;
  @Column({ default: new Date().toISOString() })
  createdAt: string;
  @Column({ default: process.env.PASSWORD_HASH })
  passwordHash: string;

  @OneToOne(() => UserEmailConfirmation)
  @JoinColumn()
  emailConfirmation: UserEmailConfirmation;

  @OneToOne(() => UserPasswordRecovery)
  @JoinColumn()
  passwordRecovery: UserPasswordRecovery;

  @OneToMany(() => Device, (device) => device.user)
  @JoinColumn()
  devices: Device[];

  @OneToMany(() => Comment, (c) => c.user)
  @JoinColumn()
  comments: Comment[];

  @OneToOne(() => PostLike)
  @JoinColumn()
  postLike: PostLike;
}
