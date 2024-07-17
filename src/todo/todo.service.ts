import { Injectable } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from 'src/auth/entities/auth.entity';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo) private readonly todoRepository: Repository<Todo>,
    @InjectRepository(Auth)
    private authRepository: Repository<Auth>,
  ) {}

  create(createTodoDto: CreateTodoDto) {
    return this.todoRepository.save(createTodoDto);
  }

  findOne(condition: any) {
    return this.todoRepository.findOne(condition);
  }

  findAll(condition: any) {
    return this.todoRepository.find(condition);
  }

  findUser(condition: any) {
    return this.authRepository.findOne(condition);
  }

  async update(id: string, updateTodoDto: UpdateTodoDto) {
    return this.todoRepository.update({ uuid: id }, updateTodoDto as any);
  }

  remove(id: number) {
    return this.todoRepository.delete(id);
  }
}
