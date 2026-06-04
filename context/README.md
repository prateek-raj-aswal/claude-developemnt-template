# Project Context

Project-specific configuration consumed by Claude sub-agents at every pipeline stage.

These files act as the persistent cognitive framework of the project. Fill them in once before running `/clarify`. Agents will read them on every invocation — no rebuild step required.

## Required files (agents block if missing)

| File | Read by | Purpose |
|---|---|---|
| `tech-stack.html` | `backend`, `frontend`, `qa`, `devops` | Frameworks, test runners, deployment target |
| `project-brief.html` | `clarify`, `architect` | Goals, personas, scale, NFRs, out-of-scope |

## Recommended files

| File | Read by | Purpose |
|---|---|---|
| `docker.html` | `backend`, `frontend`, `qa`, `devops` | Local Docker Compose services, ports, health checks |
| `constraints.html` | `architect` | Hard technical/security/dependency constraints |
| `feature-decisions.html` | `clarify`, `architect`, `doc-writer` | Feature decisions, future ideas, and their statuses |
