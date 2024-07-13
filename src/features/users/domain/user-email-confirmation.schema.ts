import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.schema';
import add from 'date-fns/add';

@Entity()
export class UserEmailConfirmation {
  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()' })
  confirmationCode: string;
  @Column({
    type: 'timestamp with time zone',
    default: add(new Date(), { hours: 5, seconds: 20 }),
  })
  expirationDate: Date;
  @Column({ default: false })
  isConfirmed: boolean;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
  @PrimaryColumn()
  userId: string;
}
