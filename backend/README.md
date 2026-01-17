# Distributed Workflow Automation Platform - Backend

A production-ready distributed workflow orchestration platform with DAG-based execution, secure plugin runtime, and real-time observability.

## Features

- ✅ **DAG-based Workflow Engine** - Deterministic, idempotent execution with topological ordering
- ✅ **IF/ELSE Branching** - Conditional execution with automatic branch skipping
- ✅ **Built-in Plugins** - TEXT_TRANSFORM, API_PROXY, DATA_AGGREGATOR, DELAY
- ✅ **Plugin System** - Secure subprocess isolation with timeout enforcement
- ✅ **Distributed Queue** - Redis-backed Bull queue for horizontal scalability
- ✅ **Retry Logic** - Exponential backoff with configurable strategies
- ✅ **WebSocket Real-time** - Live status updates via WebSocket
- ✅ **NDJSON Log Streaming** - Real-time log streaming endpoint
- ✅ **RBAC** - Role-based access control (Admin/User)
- ✅ **REST API** - Complete workflow, execution, and plugin management
- ✅ **Version Control** - Workflow versioning and pinning
- ✅ **SSRF Protection** - Built-in protection for API_PROXY plugin
- ✅ **Response Caching** - Redis caching for API_PROXY

## Tech Stack

- **Runtime**: Node.js 18+ with TypeScript
- **Build**: Babel 7 with TypeScript preset (fast transpilation)
- **Database**: PostgreSQL 14+ with Prisma ORM
- **Cache/Queue**: Redis 6+ with Bull
- **Storage**: MinIO (S3-compatible)
- **Authentication**: JWT with bcrypt
- **Validation**: Zod schemas
- **Real-time**: WebSocket (ws)

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose

### Installation

1. **Clone and navigate**:

   ```bash
   cd backend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment**:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start infrastructure**:

   ```bash
   docker-compose up -d
   ```

5. **Run database migrations**:

   ```bash
   npm run prisma:generate
   npm run migrate
   ```

6. **Start development server**:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Workflows

- `POST /api/workflows` - Create workflow
- `GET /api/workflows` - List workflows
- `GET /api/workflows/:id` - Get workflow
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow
- `POST /api/workflows/:id/versions` - Create version
- `GET /api/workflows/:id/versions` - List versions
- `POST /api/workflows/:id/versions/:versionId/pin` - Pin version

### Execution (Runs)

- `POST /api/workflows/:workflowId/runs` - Trigger execution
- `GET /api/runs` - List executions
- `GET /api/runs/:runId` - Get execution
- `POST /api/runs/:runId/pause` - Pause execution
- `POST /api/runs/:runId/resume` - Resume execution
- `POST /api/runs/:runId/cancel` - Cancel execution
- `GET /api/runs/:runId/steps` - Get step executions
- `GET /api/runs/:runId/steps/:nodeId` - Get specific step
- `POST /api/runs/:runId/steps/:nodeId/retry` - Retry failed step
- `GET /api/runs/:runId/logs` - Get execution logs
- `GET /api/runs/:runId/logs/stream` - Stream logs (NDJSON)

### Plugins

- `GET /api/plugins` - List plugins
- `GET /api/plugins/:pluginId` - Get plugin details
- `POST /api/plugins` - Create plugin (ADMIN only)
- `POST /api/plugins/:pluginId/versions` - Create plugin version (ADMIN only)
- `GET /api/plugins/:pluginId/versions` - List plugin versions

### WebSocket

- `WS /ws?token=<jwt>` - Real-time updates
  - `SUBSCRIBE_RUN` - Subscribe to run updates
  - `UNSUBSCRIBE_RUN` - Unsubscribe from run
  - Server events: `RUN_STATUS`, `STEP_STATUS`, `STEP_LOG`

## Development

### Project Structure (Feature-Based "Screaming Architecture")

```
backend/
├── src/
│   ├── app.ts               # Express app setup
│   ├── server.ts            # Server + WebSocket initialization
│   ├── config/              # Environment, Swagger configuration
│   │   ├── env.ts
│   │   └── swagger.ts
│   ├── shared/              # Shared utilities
│   │   ├── errors/          # Error classes (ApiError, handlers)
│   │   ├── http/            # Middleware (auth, rbac, validation)
│   │   ├── logger/          # Winston logger
│   │   ├── crypto/          # SHA-256, stable stringify
│   │   └── utils/           # Sleep, pagination, SSRF blocklist
│   ├── infra/               # Infrastructure
│   │   ├── database.ts      # Prisma client
│   │   ├── redis/           # Redis client and key patterns
│   │   └── queue/           # Bull queues and workers
│   └── modules/             # Feature modules
│       ├── auth/            # Authentication (JWT, RBAC)
│       ├── plugins/         # Plugin CRUD API
│       ├── workflows/       # Workflow management
│       ├── runs/            # Execution management
│       ├── engine/          # Execution engine
│       │   ├── dag/         # DAG building, IF branching
│       │   ├── execution/   # Step runner, retry, idempotency
│       │   └── runtime/     # Plugin executor, builtins
│       └── realtime/        # WebSocket real-time updates
├── prisma/
│   └── schema.prisma        # Database schema
├── docker-compose.yml       # Local development infrastructure
└── package.json
```

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run tests

## DAG Workflow Format

```json
{
  "nodes": [
    {
      "id": "node-1",
      "type": "TEXT_TRANSFORM",
      "pluginId": "plugin-uuid",
      "pluginVersion": "1.0.0",
      "config": {
        "transform": "uppercase"
      },
      "retryConfig": {
        "maxAttempts": 3,
        "backoffMs": 1000,
        "backoffMultiplier": 2
      }
    }
  ],
  "edges": [
    {
      "from": "node-1",
      "to": "node-2",
      "condition": {
        "type": "ALWAYS"
      }
    }
  ]
}
```

## Environment Variables

See `.env.example` for complete configuration options.

Key variables:

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `MINIO_*` - MinIO configuration
- `PLUGIN_TIMEOUT_MS` - Plugin execution timeout (default: 30000)
- `PLUGIN_MEMORY_LIMIT_MB` - Memory limit per plugin (default: 512)

## Docker Deployment

```bash
# Build image
docker build -t workflow-platform .

# Run with docker-compose
docker-compose up
```

## Testing

```bash
# Run all tests
npm test

# Run units tests only
npm run test:unit

# Run with coverage
npm run test:coverage
```

## Production Considerations

1. **Environment Variables**: Update `.env` with production secrets
2. **Database**: Use managed PostgreSQL in production
3. **Redis**: Use Redis cluster for high availability
4. **Monitoring**: Integrate with logging/monitoring service
5. **Security**: Enable HTTPS, rate limiting, and API authentication
6. **Scaling**: Deploy multiple API instances behind load balancer

## Architecture

### Execution Flow

1. User creates workflow with DAG definition
2. User triggers execution for a workflow
3. DAG validator ensures no cycles and proper structure
   4.Execution engine performs topological sort
4. Root nodes queued in Redis
5. Bull workers execute nodes in parallel
6. Plugin code runs in isolated subprocess
7. Results stored in PostgreSQL
8. Dependent nodes queued upon completion
9. Workflow marked complete when all nodes succeed

### Retry Strategy

- Automatic retry for transient errors (network, timeout, 5xx)
- Exponential backoff with jitter
- Configurable max attempts per node
- Non-retryable errors (validation, 4xx) fail immediately

### Idempotency

- Each step execution has unique execution key: `SHA256(runId:nodeId:retryCount)`
- Prevents duplicate execution on retry/replay
- Database constraint ensures single execution per key

## License

MIT

## Support

For issues and feature requests, please open an issue in the repository.
