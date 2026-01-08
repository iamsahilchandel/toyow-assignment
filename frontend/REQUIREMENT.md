Tech Stack: TailwindCSS, ShadcnUI, React, Vite, TypeScript, WebSockets, REST, DAG Visualization
Experience Level: Senior / Lead Frontend Engineer

🔍 Role Overview

We are building a distributed workflow automation platform where users can visually design, execute, and monitor complex DAG-based workflows composed of sandboxed plugins.

As a Frontend Engineer, you will own the entire user experience—from a drag-and-drop workflow builder to real-time execution visualization and log streaming. You will work closely with backend engineers to deliver a low-latency, real-time, production-grade SaaS UI.

This role demands strong state modeling, visual graph rendering, real-time data handling, and TypeScript-driven architecture discipline.

🧠 Core Responsibilities
1️⃣ Workflow Builder (DAG Editor)

You will design and implement a visual DAG workflow editor that allows users to:

Create workflow nodes representing Plugins

Define directed edges for execution order

Support:

Parallel execution paths

Conditional IF / ELSE branches

Fan-out / fan-in node patterns

Enforce DAG constraints:

No cycles

Deterministic ordering

Node-level configuration panels:

Plugin-specific settings (e.g. Caesar cipher shift, API headers, delay mode)

Retry configuration (max retries, backoff)

Drag, drop, connect, delete, rearrange nodes intuitively

Validate workflows client-side before submission

Deliverables:

Graph rendering layer (e.g. React Flow / custom canvas)

Type-safe workflow schema validation

Undo/redo support

Zoom, pan, auto-layout support

2️⃣ Real-Time Execution Visualization

You will build a live execution viewer that visually reflects workflow state in real time.

Display DAG execution status:

Pending

Running

Succeeded

Failed

Retrying

Paused / Cancelled

Animate node transitions based on backend events

Highlight:

Parallel execution

Branch paths taken

Support pause / resume / cancel controls

Handle reconnection & replay logic on page refresh

Data Sources:

WebSocket events

NDJSON streaming log endpoint

3️⃣ Live Logs & Streaming Console

Implement a streaming execution log viewer:

Parse NDJSON streams incrementally

Display:

Step inputs / outputs

Execution duration

Error traces

Retry attempts

Support:

Auto-scroll

Pause scrolling

Filter by step ID / severity

Search within logs

Gracefully handle large log volumes without freezing the UI

4️⃣ Workflow & Run Management UI

Build CRUD interfaces for:

Workflow definitions

Workflow versioning:

View diffs between versions

Rollback to previous versions

Execution runs:

Run history list

Status summary

Metadata (start time, duration, result)

Ownership & access control visibility

5️⃣ Authentication & RBAC Awareness

Frontend must enforce role-based UI behavior:

Admin

View all workflows

Manage plugins

View system-wide executions

User

CRUD only own workflows

View own execution history

Responsibilities include:

Token handling

Role-aware routing & guards

UI access restrictions

6️⃣ API & Real-Time Integration

You will:

Consume REST APIs defined via OpenAPI spec

Implement WebSocket lifecycle:

Connect / reconnect

Backpressure handling

Event buffering

Ensure deterministic UI state despite async execution

Handle partial failures gracefully

7️⃣ Frontend Architecture & Performance

You are expected to design scalable frontend architecture, including:

State management strategy:

Workflow graph state

Execution state

Streaming logs

Component isolation & reusability

Performance optimization:

Virtualized lists

Memoization

Efficient re-renders

Error boundaries & fallback UIs

8️⃣ Developer Experience & Quality

Strict TypeScript usage (no any)

Shared types with backend (OpenAPI / generated clients)

ESLint, Prettier, Husky integration

Unit tests for:

Graph logic

UI state reducers

Basic E2E coverage for critical flows

🧰 Required Skills
Must-Have

Expert knowledge of React + TypeScript

Experience building graph / DAG-based UIs

Strong understanding of async state & real-time systems

WebSocket & streaming data handling

REST API integration & error handling

Advanced UI performance optimization

Good to Have

Experience with:

React Flow / D3 / Canvas-based UIs

NDJSON streaming

Workflow engines or orchestration tools

Familiarity with distributed systems concepts (idempotency, retries)

Experience in SaaS dashboards or developer tools

📦 What Success Looks Like

Users can visually build complex workflows without confusion

Execution state updates feel instantaneous and reliable

UI never blocks—even with large DAGs and heavy logs

Frontend architecture scales as plugins & features grow

Strong collaboration with backend engineers using shared contracts
