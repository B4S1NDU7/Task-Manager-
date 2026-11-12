import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { TaskStatus } from './task-status.enum.js';
import { Task } from './task.entity.js';

@Injectable()
export class TasksService {
  private readonly tasks = new Map<string, Task>();

  // LLM: Find every task in creation order, newest first, with optional status filtering and due date sorting.
  findAll(status?: TaskStatus, sortByDueDate?: 'asc' | 'desc'): Task[] {
    let result = [...this.tasks.values()];
    if (status) {
      result = result.filter((task) => task.status === status);
    }
    if (sortByDueDate) {
      result.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        const comp = a.dueDate.localeCompare(b.dueDate);
        return sortByDueDate === 'asc' ? comp : -comp;
      });
    } else {
      result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return result;
  }

  // LLM: Return one task or report that its identifier does not exist.
  findOne(id: string): Task {
    const task = this.tasks.get(id);
    if (!task) {
      throw new NotFoundException(`Task with id "${id}" was not found.`);
    }
    return task;
  }

  // LLM: Create a task with its generated identifier and creation timestamp.
  create(dto: CreateTaskDto): Task {
    const task: Task = {
      id: randomUUID(),
      title: dto.title,
      ...(dto.description !== undefined && { description: dto.description }),
      status: dto.status ?? TaskStatus.TODO,
      ...(dto.dueDate !== undefined && { dueDate: dto.dueDate }),
      createdAt: new Date().toISOString(),
    };
    this.tasks.set(task.id, task);
    return task;
  }

  // LLM: Update only supplied task fields and reject empty patches.
  update(id: string, dto: UpdateTaskDto): Task {
    const task = this.findOne(id);
    if (
      dto.title === undefined &&
      dto.description === undefined &&
      dto.status === undefined &&
      dto.dueDate === undefined
    ) {
      throw new BadRequestException('At least one field must be provided.');
    }

    const updatedTask: Task = {
      ...task,
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined &&
        dto.description !== '' && { description: dto.description }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.dueDate !== undefined &&
        dto.dueDate !== '' && { dueDate: dto.dueDate }),
    };
    if (dto.description === '') {
      delete updatedTask.description;
    }
    if (dto.dueDate === '') {
      delete updatedTask.dueDate;
    }
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  // LLM: Remove a task or report that its identifier does not exist.
  remove(id: string): void {
    this.findOne(id);
    this.tasks.delete(id);
  }
}
