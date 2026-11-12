import { beforeEach, describe, expect, it } from 'vitest';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { TaskStatus } from './task-status.enum.js';
import { TasksController } from './tasks.controller.js';
import { TasksService } from './tasks.service.js';

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  beforeEach(() => {
    service = new TasksService();
    controller = new TasksController(service);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll returns all tasks', () => {
    service.create({ title: 'Task 1' });
    service.create({ title: 'Task 2' });
    const tasks = controller.findAll();
    expect(tasks).toHaveLength(2);
  });

  it('findOne returns a single task by id', () => {
    const task = service.create({ title: 'Target Task' });
    const found = controller.findOne(task.id);
    expect(found.id).toBe(task.id);
    expect(found.title).toBe('Target Task');
  });

  it('create delegates to service.create', () => {
    const dto: CreateTaskDto = {
      title: 'Created Task',
      description: 'Desc',
      status: TaskStatus.IN_PROGRESS,
    };
    const created = controller.create(dto);
    expect(created.id).toBeDefined();
    expect(created.title).toBe('Created Task');
  });

  it('update delegates to service.update', () => {
    const task = service.create({ title: 'Original Task' });
    const dto: UpdateTaskDto = { title: 'Updated Title' };
    const updated = controller.update(task.id, dto);
    expect(updated.title).toBe('Updated Title');
  });

  it('remove deletes a task', () => {
    const task = service.create({ title: 'To Remove' });
    expect(() => controller.remove(task.id)).not.toThrow();
    expect(controller.findAll()).toHaveLength(0);
  });
});

