import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/domain/user.schema';

@Entity()
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  ip: string;
  @Column()
  title: string;
  @Column()
  lastActiveDate: string;
  @Column()
  deviceId: string;
  @Column()
  expirationDate: number;

  @ManyToOne(() => User, (user) => user.devices)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;
}
