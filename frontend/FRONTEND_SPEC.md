# FRONTEND_SPEC.md
## Distributed Workflow Builder (React + Vite + TypeScript)
### Feature-Based “Screaming Architecture” • Redux Toolkit • RTK Query • Tailwind v4 + shadcn/ui • Zod + RHF

This document is the frontend blueprint for the **Distributed Workflow Builder + Plugin Runtime** system (similar to n8n).  
It maps UI requirements to backend API routes, provides the full recommended feature-based folder structure, state strategy, page layout, route map, RTK Query services, and key component responsibilities.

---

# 0) Frontend Scope (Mordern UI with Shadcn)

The frontend must support:

✅ Authentication (register/login/logout)  
✅ Dashboard listing workflows + runs  
✅ Drag-and-drop workflow builder (DAG-based) with:
- Parallel paths
- IF/ELSE branching paths
- Plugin step configuration panel
✅ Workflow versioning panel (browse versions / create new version)  
✅ Run a workflow version  
✅ Real-time DAG execution viewer:
- step status changes live
- logs streaming live
✅ Run history viewer + NDJSON stream parser  
✅ RBAC UI behavior:
- Admin sees plugins module + all workflows/runs
- User sees only their own workflows/runs

---

# 1) Tech Stack

- Vite + React + TypeScript
- react-router-dom
- Redux + Redux Toolkit
- RTK Query (Redux Query)
- Tailwind CSS v4
- shadcn/ui components
- zod + react-hook-form

Recommended extras (optional but helpful):
- reactflow (workflow builder canvas)
- lucide-react (icons)
- sonner (toast notifications)
- class-variance-authority (shadcn standard)
- date-fns (date formatting)

---

# 2) Feature-Based “Screaming Architecture” Frontend Structure

### Folder Structure (Single Frontend Project)

```txt
frontend/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── src/
    ├── main.tsx
    ├── app/
    │   ├── App.tsx
    │   ├── router.tsx
    │   ├── providers.tsx
    │   ├── store.ts
    │   ├── hooks.ts
    │   └── env.ts
    ├── shared/
    │   ├── ui/                       # shadcn/ui generated components live here
    │   ├── components/
    │   │   ├── PageHeader.tsx
    │   │   ├── LoadingState.tsx
    │   │   ├── ErrorState.tsx
    │   │   ├── ConfirmDialog.tsx
    │   │   └── ProtectedRoute.tsx
    │   ├── layouts/
    │   │   ├── AppLayout.tsx
    │   │   ├── AuthLayout.tsx
    │   │   └── AdminLayout.tsx
    │   ├── lib/
    │   │   ├── cn.ts
    │   │   ├── http.ts              # fetch baseQuery wrapper (auth headers)
    │   │   ├── ndjson.ts            # NDJSON parser helpers
    │   │   ├── websocket.ts         # WS client helpers
    │   │   └── dates.ts
    │   ├── types/
    │   │   ├── api.ts
    │   │   ├── auth.ts
    │   │   ├── workflow.ts
    │   │   ├── run.ts
    │   │   └── plugins.ts
    │   └── constants/
    │       ├── routes.ts
    │       └── roles.ts
    ├── modules/
    │   ├── auth/
    │   │   ├── pages/
    │   │   │   ├── LoginPage.tsx
    │   │   │   └── RegisterPage.tsx
    │   │   ├── components/
    │   │   │   ├── LoginForm.tsx
    │   │   │   └── RegisterForm.tsx
    │   │   ├── auth.slice.ts
    │   │   ├── auth.api.ts
    │   │   ├── auth.schemas.ts
    │   │   └── auth.selectors.ts
    │   ├── dashboard/
    │   │   ├── pages/
    │   │   │   └── DashboardHomePage.tsx
    │   │   └── components/
    │   │       ├── QuickActions.tsx
    │   │       └── StatsCards.tsx
    │   ├── workflows/
    │   │   ├── pages/
    │   │   │   ├── WorkflowsListPage.tsx
    │   │   │   ├── WorkflowDetailsPage.tsx
    │   │   │   ├── WorkflowBuilderPage.tsx
    │   │   │   └── WorkflowVersionsPage.tsx
    │   │   ├── components/
    │   │   │   ├── WorkflowCard.tsx
    │   │   │   ├── WorkflowForm.tsx
    │   │   │   ├── WorkflowVersionPanel.tsx
    │   │   │   ├── VersionDiffViewer.tsx          # optional
    │   │   │   └── DeleteWorkflowButton.tsx
    │   │   ├── builder/
    │   │   │   ├── WorkflowCanvas.tsx              # reactflow
    │   │   │   ├── NodePalette.tsx
    │   │   │   ├── NodeConfigDrawer.tsx
    │   │   │   ├── EdgeRules.ts
    │   │   │   ├── nodes/
    │   │   │   │   ├── TextTransformNode.tsx
    │   │   │   │   ├── ApiProxyNode.tsx
    │   │   │   │   ├── DataAggregatorNode.tsx
    │   │   │   │   ├── DelayNode.tsx
    │   │   │   │   └── IfNode.tsx
    │   │   │   ├── workflowDefinition.mapper.ts   # canvas -> backend JSON
    │   │   │   ├── workflowDefinition.validator.ts# client-side validation
    │   │   │   └── builder.types.ts
    │   │   ├── workflows.api.ts
    │   │   ├── workflows.schemas.ts
    │   │   └── workflows.selectors.ts
    │   ├── runs/
    │   │   ├── pages/
    │   │   │   ├── RunsListPage.tsx
    │   │   │   ├── RunDetailsPage.tsx
    │   │   │   └── RunLogsPage.tsx
    │   │   ├── components/
    │   │   │   ├── RunStatusBadge.tsx
    │   │   │   ├── RunActions.tsx
    │   │   │   ├── StepsTable.tsx
    │   │   │   ├── LogsViewer.tsx
    │   │   │   └── LiveRunViewer.tsx               # visual DAG status viewer
    │   │   ├── runs.api.ts
    │   │   ├── runs.schemas.ts
    │   │   └── runs.selectors.ts
    │   ├── plugins/
    │   │   ├── pages/
    │   │   │   ├── PluginsListPage.tsx
    │   │   │   └── PluginDetailsPage.tsx
    │   │   ├── components/
    │   │   │   ├── PluginCard.tsx
    │   │   │   ├── PluginVersionTable.tsx
    │   │   │   └── CreatePluginVersionDialog.tsx
    │   │   ├── plugins.api.ts
    │   │   └── plugins.schemas.ts
    │   └── realtime/
    │       ├── realtime.slice.ts
    │       ├── realtime.api.ts                    # optional
    │       ├── wsClient.ts
    │       └── realtime.types.ts
    └── styles/
        └── globals.css
```

### Why this is “Screaming Architecture”
- `modules/*` are the product capabilities.
- Everything inside a module is scoped to that domain.
- Shared UI utilities stay under `shared/*`.
- API route mapping lives in `*.api.ts` per feature.

---

# 3) Routing (react-router-dom)

## 3.1 Route Map

Public routes:
- `/login`
- `/register`

Protected routes:
- `/` → Dashboard home
- `/workflows`
- `/workflows/:workflowId`
- `/workflows/:workflowId/builder`
- `/workflows/:workflowId/versions`
- `/runs`
- `/runs/:runId`
- `/runs/:runId/logs`

Admin-only routes:
- `/plugins`
- `/plugins/:pluginId`

## 3.2 Layout Model
- `AuthLayout` → login/register
- `AppLayout` → app shell (sidebar + navbar)
- `AdminLayout` → ensures ADMIN role

---

# 4) Global State Management Strategy (Redux Toolkit)

## 4.1 What Goes in Redux Store?
Redux should store:
- auth session state:
  - `accessToken`
  - `user profile`
- lightweight UI state:
  - selected workflow/node
  - active subscriptions
- real-time status caching:
  - run statuses (for live updates)

RTK Query should store:
- server cached data:
  - workflows list
  - workflow details
  - versions
  - runs list
  - run steps + logs
  - plugins

## 4.2 Suggested slices
- `auth.slice.ts` → token + user
- `realtime.slice.ts` → websocket events buffer
- builder local state should remain in component state unless shared globally.

---

# 5) API Layer (RTK Query) Using Your Backend Routes

Base URL:
- `VITE_API_URL=https://localhost:3000`

Auth header:
- attach `Authorization: Bearer <token>` in baseQuery wrapper.

---

## 5.1 Auth API (modules/auth/auth.api.ts)

Routes used:
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

RTK endpoints:
- `register()`
- `login()`
- `me()`

---

## 5.2 Plugins API (modules/plugins/plugins.api.ts) [ADMIN]

Routes used:
- `GET /plugins`
- `GET /plugins/:pluginId`
- `POST /plugins`
- `POST /plugins/:pluginId/versions`
- `GET /plugins/:pluginId/versions`

RTK endpoints:
- `getPlugins()`
- `getPlugin(pluginId)`
- `createPlugin()`
- `createPluginVersion(pluginId)`
- `getPluginVersions(pluginId)`

---

## 5.3 Workflows API (modules/workflows/workflows.api.ts)

Routes used:
- `POST /workflows`
- `GET /workflows`
- `GET /workflows/:workflowId`
- `PATCH /workflows/:workflowId`
- `DELETE /workflows/:workflowId`

Workflow Versions:
- `POST /workflows/:workflowId/versions`
- `GET /workflows/:workflowId/versions`
- `GET /workflows/:workflowId/versions/:versionId`

RTK endpoints:
- `createWorkflow()`
- `getWorkflows()`
- `getWorkflow(workflowId)`
- `updateWorkflow(workflowId)`
- `deleteWorkflow(workflowId)`
- `createWorkflowVersion(workflowId)`
- `getWorkflowVersions(workflowId)`
- `getWorkflowVersion(workflowId, versionId)`

---

## 5.4 Runs API (modules/runs/runs.api.ts)

Routes used:
- `POST /workflows/:workflowId/runs`
- `GET /runs`
- `GET /runs/:runId`
- `POST /runs/:runId/pause`
- `POST /runs/:runId/resume`
- `POST /runs/:runId/cancel`

Steps:
- `GET /runs/:runId/steps`
- `GET /runs/:runId/steps/:nodeId`
- `POST /runs/:runId/steps/:nodeId/retry`

Logs:
- `GET /runs/:runId/logs`
- `GET /runs/:runId/logs/stream` (NDJSON)

RTK endpoints:
- `startRun(workflowId)`
- `getRuns()`
- `getRun(runId)`
- `pauseRun(runId)`
- `resumeRun(runId)`
- `cancelRun(runId)`
- `getRunSteps(runId)`
- `getRunStep(runId, nodeId)`
- `retryStep(runId, nodeId)`
- `getRunLogs(runId)` (paged)
- NDJSON handled via custom streaming fetch (NOT RTK Query)

---

# 6) Forms (react-hook-form + zod)

## 6.1 Authentication Forms
- LoginForm
- RegisterForm
Validation:
- email required, valid email
- password min 6

## 6.2 Workflow Create/Edit Forms
WorkflowForm:
- name required
- description optional

## 6.3 Node Configuration Forms (Builder)
NodeConfigDrawer uses RHF + zod based on node type:

TEXT_TRANSFORM:
- shift: number (int)

API_PROXY:
- url: string (url)
- cache: boolean
- headers: array of key/value pairs

DELAY:
- ms: number
- blocking: boolean

IF:
- expr: string

DATA_AGGREGATOR:
- no config (or optional fields)

---

# 7) Workflow Builder UI (Drag & Drop DAG)

## 7.1 Recommended Library
Use **React Flow** for:
- nodes & edges rendering
- drag/drop nodes
- zoom/pan
- edge connections

## 7.2 Core Builder Components

### WorkflowCanvas.tsx
Responsibilities:
- store nodes/edges state
- handle create/delete nodes
- handle connect edges
- highlight invalid edges
- export workflow definition JSON

### NodePalette.tsx
- displays plugin types:
  - TEXT_TRANSFORM
  - API_PROXY
  - DATA_AGGREGATOR
  - DELAY
  - IF
- drag into canvas

### NodeConfigDrawer.tsx
- opens when node selected
- shows config form (RHF + zod)
- updates node config state

### workflowDefinition.mapper.ts
Converts ReactFlow nodes/edges into backend JSON format:
```json
{ "nodes": [...], "edges": [...], "settings": {...} }
```

### workflowDefinition.validator.ts
Client-side validation for UX:
- required configs
- IF node must have two outgoing edges
- optional cycle detection (basic)
Backend remains source of truth.

---

# 8) Live Execution Viewer (Real-time DAG Status)

## 8.1 UI Requirements
On a run details page:
- show DAG nodes with statuses:
  - PENDING
  - RUNNING
  - SUCCESS
  - FAILED
  - SKIPPED
  - RETRYING
- statuses update live via WebSocket events

## 8.2 Implementation Strategy
- Fetch workflow version definition (nodes/edges)
- Fetch run steps: `GET /runs/:runId/steps`
- Subscribe WS to run updates:
  - `SUBSCRIBE_RUN`
- Update local Redux `realtime.slice` state
- Re-render DAG highlighting

---

# 9) NDJSON Logs Streaming Viewer

Backend endpoint:
- `GET /runs/:id/logs/stream`

Frontend behavior:
- Use `fetch()` + `ReadableStream`
- Parse NDJSON line-by-line
- Append logs to UI list

### LogsViewer.tsx responsibilities
- start streaming when user opens Logs page
- stop streaming on unmount
- handle partial lines safely
- auto-scroll toggle

---

# 10) UI Screens (What Pages Exist)

## Auth
- LoginPage
- RegisterPage

## Dashboard
- DashboardHomePage

## Workflows
- WorkflowsListPage:
  - list workflows
  - create new workflow
- WorkflowDetailsPage:
  - metadata + quick actions
  - link to builder + versions
- WorkflowBuilderPage:
  - ReactFlow canvas
  - NodePalette
  - NodeConfigDrawer
  - Save (create new version)
- WorkflowVersionsPage:
  - list versions
  - view version definition
  - run specific version

## Runs
- RunsListPage:
  - list runs
  - filter by status/workflow
- RunDetailsPage:
  - Run actions (pause/resume/cancel)
  - StepsTable
  - LiveRunViewer (visual DAG)
- RunLogsPage:
  - LogsViewer with NDJSON stream

## Plugins (Admin)
- PluginsListPage
- PluginDetailsPage

---

# 11) Component Contracts & Data Flow

## 11.1 Common Flow: Create Workflow → Build → Version → Run

1) User creates workflow:
- POST `/workflows`

2) User opens builder and designs DAG locally.

3) Save new version:
- POST `/workflows/:workflowId/versions`

4) Run workflow:
- POST `/workflows/:workflowId/runs`

5) View run details:
- GET `/runs/:runId`
- GET `/runs/:runId/steps`

6) Live updates:
- WS `/ws` subscribe runId

7) Logs:
- GET `/runs/:runId/logs`
- GET `/runs/:runId/logs/stream`

---

# 12) RBAC UX Rules

### USER role
- cannot access `/plugins`
- should not see plugin admin actions

### ADMIN role
- can view all workflows and runs
- sees plugins section

Implementation:
- `ProtectedRoute`
- `AdminRoute` wrapper for /plugins routes
- hide sidebar items based on role

---

# 13) UI Design (Tailwind v4 + shadcn/ui)

Recommended shadcn components:
- Button
- Card
- Badge
- Tabs
- Dialog
- DropdownMenu
- Sheet (for NodeConfigDrawer)
- Table
- Input / Checkbox / Switch
- Toast/Sonner (optional)

---

# 14) Suggested Development Order (Frontend)

1) Setup Vite + Tailwind + shadcn/ui  
2) Router + layouts + sidebar  
3) Auth flow (login/register/me)  
4) Workflows list + create workflow  
5) Workflow details + versions  
6) Builder with ReactFlow nodes/edges  
7) Save workflow version (API call)  
8) Start run + runs list  
9) Run detail + steps table  
10) WebSocket live updates  
11) NDJSON log streaming UI  
12) Admin plugins pages  

---

# 15) Key Files You Must Implement First

### App Wiring
- `src/app/store.ts` (redux store)
- `src/app/router.tsx` (routes + layouts)
- `src/shared/lib/http.ts` (RTK baseQuery w/ auth header)
- `src/modules/auth/auth.api.ts`

### Core Pages
- `WorkflowsListPage.tsx`
- `WorkflowBuilderPage.tsx`
- `RunsListPage.tsx`
- `RunDetailsPage.tsx`
- `RunLogsPage.tsx`

---

# 16) Minimum Acceptance Checklist (Frontend)

✅ Auth screens + JWT storage  
✅ Dashboard listing workflows  
✅ Workflow builder supports:
- nodes & edges
- edit node configs
- branching + parallel connections
✅ Versioning panel
✅ Run workflow + view run history
✅ Real-time updates (WebSocket)
✅ NDJSON stream logs parsing UI
✅ Admin plugins page (RBAC restricted)

---
