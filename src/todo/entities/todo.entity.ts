import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Auth } from 'src/auth/entities/auth.entity';

@Entity('todos')
export class Todo {
  [x: string]: any;
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  uuid: string;

  @Column({ nullable: true })
  summary: string;

  @Column({ nullable: true, default: false })
  status: boolean;

  @Column()
  due: Date;

  @Column()
  description: string;

  @ManyToOne(() => Auth, (auth) => auth.todos)
  @JoinColumn([{ name: 'userUuid', referencedColumnName: 'uuid' }])
  user: Auth;

  @Column()
  userUuid: string;
}
