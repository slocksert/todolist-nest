import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Request } from 'express';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { Todo } from './entities/todo.entity';

@Controller('todo')
export class TodoController {
  constructor(
    private readonly todoService: TodoService,
    private jwtService: JwtService,
  ) {}

  async getUser(@Req() request: Request) {
    try {
      const cookie = request.cookies['jwt'];
      const data = await this.jwtService.verifyAsync(cookie);
      const user = await this.todoService.findUser({
        where: { uuid: data['id'] },
      });

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async getTodoByUuid(@Req() request: Request) {
    const user = this.getUser(request);
    const todo = await this.todoService.findAll({
      where: { userUuid: (await user).uuid },
      order: {
        summary: 'ASC',
      },
    });
    return todo;
  }

  @Get('get')
  async getTodos(@Req() request: Request) {
    const todo = this.getTodoByUuid(request);
    return todo;
  }

  @Post('create-todo')
  async create(@Body() createTodoDto: CreateTodoDto, @Req() request: Request) {
    try {
      const userUuid = (await this.getUser(request)).uuid;
      const { due } = createTodoDto;
      const [day, month, year] = due.split('/');
      const formatedData = `${year}-${day}-${month}`;

      await this.todoService.create({
        uuid: randomUUID(),
        userUuid: userUuid,
        due: formatedData,
        ...createTodoDto,
      });
      return {
        message: 'Todo created successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Todo> {
    try {
      const todo = await this.todoService.findOne({
        where: { uuid: id },
      });

      return todo;
    } catch (error) {
      throw new NotFoundException('Todo not found');
    }
  }

  @Patch('update/:id')
  async update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
    const todo = await this.findOne(id);

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    const updateData = { ...updateTodoDto };

    await this.todoService.update(id, updateData);

    return {
      message: 'Todo updated successfully',
    };
  }

  @Delete('delete/:id')
  async remove(@Param('id') id: string) {
    const todo = await this.findOne(id);

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    const todoId = todo.id;

    this.todoService.remove(todoId);
    return {
      message: 'Todo deleted successfully',
    };
  }
}
