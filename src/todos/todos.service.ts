import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodosService {
  constructor(private prisma: PrismaService) {}

  async create(createTodoDto: CreateTodoDto) {
    const { status, task, userId } = createTodoDto;
    await this.prisma.todo.create({
      data: {
        status: status,
        task: task,
        userId: userId,
      },
    });
    return 'Task added ';
  }

  async findAll() {
    const todos = await this.prisma.todo.findMany();
    return todos;
  }

  async findOne(id: number) {
    const todo = await this.prisma.todo.findUnique({ where: { id } });
    return todo;
  }

  async update(id: number, updateTodoDto: UpdateTodoDto) {
    const { status, task } = updateTodoDto;
    const todo = await this.prisma.todo.findUnique({
      where: { id },
    });
    if (!todo) {
      throw new NotFoundException('Task not found');
    }
    return this.prisma.todo.update({
      where: { id },
      data: {
        status,
        task,
      },
    });
  }

  async remove(id: number) {
    const todo = await this.prisma.todo.findUnique({
      where: { id },
    });
    if (!todo) {
      throw new NotFoundException('Task not found');
    }
    return await this.prisma.todo.delete({
      where: { id },
    });
  }
}
