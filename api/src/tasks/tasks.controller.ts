import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import type { Task } from './task.entity.js';
import { TasksService } from './tasks.service.js';

@Controller('tasks')
export class TasksController {
  // LLM: Receive the task service used to handle API requests.
  constructor(
    @Inject(TasksService) private readonly tasksService: TasksService,
  ) {}

  // LLM: Return all tasks.
  @Get()
  findAll(): Task[] {
    return this.tasksService.findAll();
  }

  // LLM: Return one task selected by its UUID.
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Task {
    return this.tasksService.findOne(id);
  }

  // LLM: Validate and create a task.
  @Post()
  create(@Body() dto: CreateTaskDto): Task {
    return this.tasksService.create(dto);
  }

  // LLM: Validate and apply a partial update to a task.
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
  ): Task {
    return this.tasksService.update(id, dto);
  }

  // LLM: Delete a task and return a no-content response.
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): void {
    this.tasksService.remove(id);
  }
}
