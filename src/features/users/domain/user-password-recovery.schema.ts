import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.schema';

@Entity()
export class UserPasswordRecovery {
  @Column({ nullable: true })
  confirmationCode: string;

  @Column({ nullable: true, type: 'timestamp with time zone' })
  expirationDate: Date;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @PrimaryColumn()
  userId: string;
}
