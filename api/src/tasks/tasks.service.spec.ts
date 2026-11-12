import { BadRequestException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it } from 'vitest';
import { TaskStatus } from './task-status.enum.js';
import { TasksService } from './tasks.service.js';

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(() => {
    service = new TasksService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates a task with default status and generated id', () => {
      const task = service.create({ title: 'Test Task' });
      expect(task.id).toBeDefined();
      expect(task.title).toBe('Test Task');
      expect(task.status).toBe(TaskStatus.TODO);
      expect(task.createdAt).toBeDefined();
      expect(task.description).toBeUndefined();
      expect(task.dueDate).toBeUndefined();
    });

    it('creates a task with all fields provided', () => {
      const task = service.create({
        title: 'Full Task',
        description: 'Detailed description',
        status: TaskStatus.IN_PROGRESS,
        dueDate: '2026-12-31T23:59:59.000Z',
      });
      expect(task.title).toBe('Full Task');
      expect(task.description).toBe('Detailed description');
      expect(task.status).toBe(TaskStatus.IN_PROGRESS);
      expect(task.dueDate).toBe('2026-12-31T23:59:59.000Z');
    });
  });

  describe('findAll', () => {
    it('returns empty array when no tasks exist', () => {
      expect(service.findAll()).toEqual([]);
    });

    it('returns tasks in descending order of creation by default', async () => {
      const task1 = service.create({ title: 'Task 1' });
      await new Promise((r) => setTimeout(r, 10));
      const task2 = service.create({ title: 'Task 2' });

      const all = service.findAll();
      expect(all).toHaveLength(2);
      expect(all[0].id).toBe(task2.id);
      expect(all[1].id).toBe(task1.id);
    });

    it('filters tasks by status when provided', () => {
      service.create({ title: 'Task A', status: TaskStatus.TODO });
      service.create({ title: 'Task B', status: TaskStatus.DONE });

      const todoOnly = service.findAll(TaskStatus.TODO);
      expect(todoOnly).toHaveLength(1);
      expect(todoOnly[0].title).toBe('Task A');

      const doneOnly = service.findAll(TaskStatus.DONE);
      expect(doneOnly).toHaveLength(1);
      expect(doneOnly[0].title).toBe('Task B');
    });

    it('sorts tasks by due date asc and desc', () => {
      service.create({ title: 'Due Later', dueDate: '2026-12-30T00:00:00.000Z' });
      service.create({ title: 'Due Earlier', dueDate: '2026-11-15T00:00:00.000Z' });

      const asc = service.findAll(undefined, 'asc');
      expect(asc[0].title).toBe('Due Earlier');
      expect(asc[1].title).toBe('Due Later');

      const desc = service.findAll(undefined, 'desc');
      expect(desc[0].title).toBe('Due Later');
      expect(desc[1].title).toBe('Due Earlier');
    });
  });

  describe('findOne', () => {
    it('returns task if found', () => {
      const created = service.create({ title: 'Find Me' });
      const found = service.findOne(created.id);
      expect(found).toEqual(created);
    });

    it('throws NotFoundException when task does not exist', () => {
      expect(() => service.findOne('non-existent-id')).toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('updates specified fields', () => {
      const created = service.create({ title: 'Old Title' });
      const updated = service.update(created.id, {
        title: 'New Title',
        status: TaskStatus.DONE,
      });

      expect(updated.title).toBe('New Title');
      expect(updated.status).toBe(TaskStatus.DONE);
      expect(service.findOne(created.id).title).toBe('New Title');
    });

    it('throws BadRequestException when update payload is empty', () => {
      const created = service.create({ title: 'Old Title' });
      expect(() => service.update(created.id, {})).toThrow(
        BadRequestException,
      );
    });

    it('throws NotFoundException when updating non-existent task', () => {
      expect(() =>
        service.update('non-existent-id', { title: 'New' }),
      ).toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes an existing task', () => {
      const created = service.create({ title: 'Delete Me' });
      service.remove(created.id);
      expect(() => service.findOne(created.id)).toThrow(NotFoundException);
    });

    it('throws NotFoundException when deleting non-existent task', () => {
      expect(() => service.remove('non-existent-id')).toThrow(
        NotFoundException,
      );
    });
  });
});
