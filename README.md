# Task Manager Application

A modern, production-grade Task Manager application built with a **NestJS** REST API backend and a **Next.js (App Router)** frontend styled with **shadcn/ui** and **Tailwind CSS v4**.

---

## Architecture & Tech Stack

- **Backend (`/api`)**:
  - [NestJS 11](https://nestjs.com/) (Node.js & TypeScript ESM)
  - `class-validator` & `class-transformer` for robust DTO payload validation
  - In-memory data store indexed by UUID
  - [Vitest 3](https://vitest.dev/) for unit and end-to-end (E2E) testing
  - [Oxlint](https://oxc.rs/) for high-performance static code analysis
- **Frontend (`/web`)**:
  - [Next.js 16](https://nextjs.org/) App Router & React 19
  - [shadcn/ui](https://ui.shadcn.com/) (Base UI primitives)
  - [Tailwind CSS v4](https://tailwindcss.com/)
  - [Sonner](https://sonner.emilkowal.ski/) toast notifications
  - [Lucide React](https://lucide.dev/) icons
- **DevOps**:
  - Multi-stage `Dockerfile` configurations for both services
  - `docker-compose.yml` for single-command orchestration

---

## Features

- **Full Task Lifecycle Management**:
  - Create tasks with `title` (required, max 120 chars), `description` (optional, max 2000 chars), `status` (`TODO`, `IN_PROGRESS`, `DONE`), and `dueDate` (optional ISO date).
  - List tasks in a clean data table with responsive layout.
  - Partial updates with validation (rejection of empty payloads and invalid enum values).
  - Deletion with modal confirmation dialog.
- **Visual Status Badges**: Distinct visual styling for To Do, In Progress, and Done states.
- **Search & Filtering (Bonus)**: Filter by status in the UI and API, plus instant client-side keyword search across title and description.
- **Due Date Sorting (Bonus)**: Sort by earliest due date, latest due date, or creation order.
- **Metrics Dashboard**: Overview cards tracking total tasks, to-do, in-progress, and completed items.
- **Interactive Feedback**: Loading skeletons, connection error states with retry actions, and toast notifications on every successful mutation.
- **Containerized Deployment (Bonus)**: Docker Compose setup to run both backend and frontend together.

---

## Prerequisites

- **Node.js**: `v20.19+` or `v22.x` (`v22.23.x` recommended)
- **Package Manager**: `npm` (`v10.x` or newer)
- **Docker** & **Docker Compose** *(optional, for containerized execution)*

---

## Quick Start (Step-by-Step from Fresh Clone)

### 1. Clone the Repository

```bash
git clone https://github.com/B4S1NDU7/Task-Manager-.git
cd Task-Manager-
```

---

### 2. Run the Backend (`/api`)

Open a terminal and navigate to the `api` folder:

```bash
cd api
```

#### a. Configure Environment Variables
Copy the sample environment file:
```bash
# On Linux/macOS
cp .env.example .env

# On Windows PowerShell
Copy-Item .env.example .env
```

Contents of `api/.env`:
```env
PORT=3000
WEB_ORIGIN=http://localhost:3001
```

#### b. Install Dependencies
```bash
npm ci
```

#### c. Build the API
```bash
npm run build
```

#### d. Run Tests & Linter
```bash
# Run unit tests
npm test

# Run end-to-end tests
npm run test:e2e

# Run linter
npm run lint
```

#### e. Start the Development Server
```bash
npm run start:dev
```
The NestJS API will start and listen at **`http://localhost:3000`**.

---

### 3. Run the Frontend (`/web`)

Open a second terminal window and navigate to the `web` folder:

```bash
cd web
```

#### a. Configure Environment Variables
Copy the sample environment file:
```bash
# On Linux/macOS
cp .env.example .env.local

# On Windows PowerShell
Copy-Item .env.example .env.local
```

Contents of `web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

#### b. Install Dependencies
```bash
npm ci
```

#### c. Build & Lint Frontend
```bash
npm run lint
npm run build
```

#### d. Start the Development Server
```bash
npm run dev
```
The Next.js frontend will start at **`http://localhost:3001`**.

Open your browser and navigate to **`http://localhost:3001`**.

---

## Run with Docker Compose (Optional)

Install and start **Docker Desktop** (Windows/macOS) or **Docker Engine with the
Docker Compose v2 plugin** (Linux). Verify Compose is available:

```bash
docker compose version
```

From the repository root (the directory containing `docker-compose.yml`), build
the images and start both services:

```bash
docker compose up --build
```

The command stays attached to the service logs. Once both services have
started, open:

- Frontend: [http://localhost:3001](http://localhost:3001)
- Backend API: [http://localhost:3000/tasks](http://localhost:3000/tasks)

Compose supplies the API's `PORT` and `WEB_ORIGIN` settings and builds the
frontend with `NEXT_PUBLIC_API_URL=http://localhost:3000`; local `.env` files
are not needed for this option. That frontend URL is embedded at image build
time, so if you change it in `docker-compose.yml`, rebuild the web image.

To run in the background instead, use:

```bash
docker compose up --build -d
docker compose logs -f
```

Stop the foreground command with `Ctrl+C`, then remove the containers with:

```bash
docker compose down
```

Tasks are stored in memory, so they are lost when the API container stops or is
recreated. No database or Docker volume setup is required.

---

## REST API Specification

| Method | Endpoint | Description | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/tasks` | List all tasks (supports `?status=` and `?sortByDueDate=`) | None | `200 OK` (Array of Tasks) |
| `GET` | `/tasks/:id` | Get single task by UUID | None | `200 OK` (Task) or `404 Not Found` |
| `POST` | `/tasks` | Create a new task | `{ title, description?, status?, dueDate? }` | `201 Created` (Created Task) or `400 Bad Request` |
| `PATCH` | `/tasks/:id` | Partial update of task fields | `{ title?, description?, status?, dueDate? }` | `200 OK` (Updated Task), `400 Bad Request`, or `404 Not Found` |
| `DELETE` | `/tasks/:id` | Delete task by UUID | None | `204 No Content` or `404 Not Found` |

### Sample `POST /tasks` Payload
```json
{
  "title": "Build landing page",
  "description": "Design responsive hero section with call-to-action",
  "status": "IN_PROGRESS",
  "dueDate": "2026-12-01T18:00:00.000Z"
}
```

---

## How I Used AI

During this assignment, I used AI coding assistance (Antigravity with Google DeepMind LLM) to help with scaffolding, implementation ideas, and test generation. I reviewed the generated suggestions and the final code, made changes where needed, and verified the application with tests, linting, and production builds. I did not treat AI-generated output as finished work without checking it; I am responsible for and can explain the code I submitted.

1. **Scaffolding and Boilerplate**:
   - Used AI to quickly draft initial NestJS boilerplate (module, controller, service, and DTO definitions with `class-validator` annotations).
   - Generated initial accessible UI components and layouts matching shadcn/ui patterns and Tailwind CSS v4 standards.

2. **Refinements and Critical Fixes Applied**:
   - **TypeScript & ESM Compilation**: Fixed decorator metadata type imports (`import type { Task }`) required under TypeScript's `isolatedModules` and `emitDecoratorMetadata` settings.
   - **React 19 & Next.js 16 Compatibility**: Resolved ESLint `react-hooks/set-state-in-effect` rule violations by decoupling dialog form state from effect cascades, using keyed form instances (`key={initialTask?.id ?? 'new-task'}`) and proper data-fetching cleanup functions.
   - **Server-Side Bonus Features**: Extended the NestJS API with query parameter filtering (`@Query('status')`) and sorting (`@Query('sortByDueDate')`) to complement client-side controls.
   - **Automated Tests**: Added 20 unit tests for controller/service behavior and 3 end-to-end tests exercising HTTP routes, including validation, using Vitest and Supertest.
   - **Production Readiness**: Added multi-stage Docker builds, environment documentation, and strict input sanitization.
