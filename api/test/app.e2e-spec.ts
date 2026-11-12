import {
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { CreateTaskDto } from '../src/tasks/dto/create-task.dto.js';
import { UpdateTaskDto } from '../src/tasks/dto/update-task.dto.js';
import { TasksController } from '../src/tasks/tasks.controller.js';

Reflect.defineMetadata(
  'design:paramtypes',
  [CreateTaskDto],
  TasksController.prototype,
  'create',
);
Reflect.defineMetadata(
  'design:paramtypes',
  [String, UpdateTaskDto],
  TasksController.prototype,
  'update',
);

describe('Tasks API (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('creates, reads, updates, and deletes tasks', async () => {
    const listBeforeCreate = await request(app.getHttpServer())
      .get('/tasks')
      .expect(200);
    expect(listBeforeCreate.body).toEqual([]);

    const createdResponse = await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: '  Ship the first version  ',
        description: 'Finish the task manager.',
        dueDate: '2026-12-01',
      })
      .expect(201);
    expect(createdResponse.body).toMatchObject({
      title: 'Ship the first version',
      description: 'Finish the task manager.',
      status: 'TODO',
      dueDate: '2026-12-01',
    });
    expect(createdResponse.body.id).toBeDefined();
    expect(createdResponse.body.createdAt).toBeDefined();

    const taskId = createdResponse.body.id as string;
    await request(app.getHttpServer())
      .get(`/tasks/${taskId}`)
      .expect(200)
      .expect(({ body }) => expect(body.id).toBe(taskId));

    await request(app.getHttpServer())
      .patch(`/tasks/${taskId}`)
      .send({ status: 'DONE' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.title).toBe('Ship the first version');
        expect(body.status).toBe('DONE');
      });

    await request(app.getHttpServer())
      .patch(`/tasks/${taskId}`)
      .send({ description: '', dueDate: '' })
      .expect(200)
      .expect(({ body }) => {
        expect(body).not.toHaveProperty('description');
        expect(body).not.toHaveProperty('dueDate');
      });

    await request(app.getHttpServer())
      .delete(`/tasks/${taskId}`)
      .expect(204);
    await request(app.getHttpServer()).get(`/tasks/${taskId}`).expect(404);
  });

  it('rejects invalid input and malformed identifiers', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: '   ' })
      .expect(400);

    await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Valid title', unexpected: true })
      .expect(400);

    await request(app.getHttpServer())
      .patch('/tasks/not-a-uuid')
      .send({ status: 'DONE' })
      .expect(400);
  });

  it('returns 400 for empty patches and 404 for missing tasks', async () => {
    await request(app.getHttpServer())
      .patch('/tasks/00000000-0000-4000-8000-000000000000')
      .send({})
      .expect(404);

    const created = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Existing task' })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/tasks/${created.body.id}`)
      .send({})
      .expect(400);

    await request(app.getHttpServer())
      .get('/tasks/00000000-0000-4000-8000-000000000000')
      .expect(404);
  });
});
