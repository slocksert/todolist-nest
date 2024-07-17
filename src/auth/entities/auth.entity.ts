import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Todo } from 'src/todo/entities/todo.entity';

@Entity('users')
export class Auth {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, unique: true })
  uuid: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Todo, (todo) => todo.user)
  todos: Todo[];
}
