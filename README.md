# Phacer

A task management application built with .NET 10 Web API and Angular 21.

## Tech Stack

**Backend:**
- .NET 10 (ASP.NET Core)
- PostgreSQL with Entity Framework Core
- JWT Authentication

**Frontend:**
- Angular 21
- Angular Material
- RxJS

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js 20+](https://nodejs.org/)
- [Docker](https://www.docker.com/) (for PostgreSQL)

## Setup

### 1. Start PostgreSQL

```bash
docker compose up -d
```

This starts a PostgreSQL 16 container with:
- Database: `phacer`
- Username: `phacer`
- Password: `phacer_dev`
- Port: `5432`

### 2. Setup the API

```bash
cd PhacerApi

# Restore dependencies
dotnet restore

# Apply migrations to create database schema
dotnet ef database update

# Run the API (http://localhost:5000)
dotnet run
```

### 3. Setup the Web App

```bash
cd PhacerWeb

# Install dependencies
npm install

# Run the dev server (http://localhost:4200)
npm start
```

### 4. Access the App

Open http://localhost:4200 in your browser. Register a new account to get started.

## Project Structure

```
Phacer/
├── PhacerApi/              # .NET Web API
│   ├── Controllers/        # API endpoints
│   ├── Data/               # EF Core DbContext
│   ├── Migrations/         # Database migrations
│   ├── Models/             # Domain entities
│   ├── Services/           # Business logic
│   └── Program.cs          # App configuration
├── PhacerWeb/              # Angular frontend
│   └── src/app/
│       ├── core/           # Guards, interceptors, services
│       ├── features/       # Auth and tasks modules
│       └── app.ts          # Root component
└── docker-compose.yml      # PostgreSQL setup
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |

### Tasks (requires JWT token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks (with optional filters) |
| GET | `/api/tasks/{id}` | Get task by ID |
| POST | `/api/tasks` | Create new task |
| PUT | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task |

### Query Parameters for GET /api/tasks
- `isCompleted` (boolean) - Filter by completion status
- `search` (string) - Search in title/description
- `priority` (0-2) - Filter by priority (Low=0, Medium=1, High=2)
- `tag` (string) - Filter by tag

## Task Model

| Field | Type | Description |
|-------|------|-------------|
| title | string | Task title (required, max 500 chars) |
| description | string? | Task description |
| dueDate | DateTime? | Optional due date |
| isCompleted | boolean | Completion status |
| priority | enum | Low, Medium, High |
| color | enum | Gray, Red, Blue, Green, Yellow |
| tags | string[] | List of tags |

## Development

### Running Tests
```bash
# API tests
cd PhacerApi && dotnet test

# Web tests
cd PhacerWeb && npm test
```

### Building for Production
```bash
# API
cd PhacerApi && dotnet publish -c Release

# Web
cd PhacerWeb && npm run build
```

## Environment Variables

The API reads configuration from `PhacerApi/appsettings.Development.json`. For production, set environment variables or create `appsettings.Production.json`.

| Setting | Description |
|---------|-------------|
| `ConnectionStrings:DefaultConnection` | PostgreSQL connection string |
| `Jwt:Key` | Secret key for JWT signing (min 32 chars) |
| `Jwt:Issuer` | JWT issuer name |
| `Jwt:Audience` | JWT audience name |
| `Jwt:ExpirationHours` | Token validity period |
