# Implementation Plan — Bed Management & Admissions Modules

## 1. Repository Audit Summary

- **Repository**: `https://github.com/jsondumpsbinary/aetherCare.git`
- **Active Branch**: `main`
- **Current State**: Clean working tree on `main`, up to date with `origin/main`.
- **Existing Tech Stack**:
  - Runtime: Node.js (v25) / Express.js (v5.3.0)
  - ORM: Prisma ORM 7 (`@prisma/client` & `prisma` v7.10.1 with `@prisma/adapter-pg` & `pg`)
  - Database: PostgreSQL (local instance `aethercare` database)
  - Frontend / Desktop: React + Vite, Electron
- **Existing Backend Structure**:
  - `server/src/app.js`: Express application initialization, CORS, JSON parsing, health check route (`/api/health`), and patient route registration (`/api/patients`).
  - `server/src/server.js`: Server bootstrap listening on configured `PORT`.
  - `server/src/config/db.js`: Prisma client instance configured with `@prisma/adapter-pg`.
  - `server/src/modules/patients`: Existing Patient Management module following Routes → Controller → Service pattern.
  - `server/prisma/schema.prisma`: Existing models: `Patient`, `Department`, `Doctor`, `OPDVisit`.
  - `server/prisma/migrations/20261113190638_init_patient_opd`: Initial baseline migration.

## 2. Architecture & Design Conventions

The new modules will strictly follow the established architecture:
- **Routes (`*.routes.js`)**: Clean Express route definitions mapping HTTP verbs to controller methods. Sub-routes with static segments (such as `/available`, `/active`) registered prior to dynamic parameter segments (`/:id`) to prevent shadowing.
- **Controllers (`*.controller.js`)**: Request body and param parsing, data type and value validation, invoking services, returning standard response structure (`{ success: true/false, message, data }`), and mapping known errors (e.g. 400 Bad Request, 404 Not Found, 409 Conflict, 500 Internal Server Error).
- **Services (`*.service.js`)**: Encapsulates all database interactions, Prisma queries, transaction logic (`prisma.$transaction`), and state machine rules.

## 3. Database Schema Requirements & Relationships

### Ward Model
- `id`: Int, `@id @default(autoincrement())`
- `name`: String, `@unique`
- `description`: String?
- `createdAt`: DateTime, `@default(now())`
- `updatedAt`: DateTime, `@updatedAt`
- `beds`: `Bed[]`

### Bed Model
- `id`: Int, `@id @default(autoincrement())`
- `bedNumber`: String, `@unique`
- `bedType`: Enum `BedType` (`GENERAL`, `ICU`, `PRIVATE`)
- `status`: Enum `BedStatus` (`AVAILABLE`, `OCCUPIED`, `MAINTENANCE`), default `AVAILABLE`
- `wardId`: Int
- `ward`: `Ward @relation(fields: [wardId], references: [id])`
- `admissions`: `Admission[]`
- Indexes: `@@index([wardId])`, `@@index([status])`

### Admission Model
- `id`: Int, `@id @default(autoincrement())`
- `patientId`: Int
- `bedId`: Int
- `admissionDate`: DateTime, `@default(now())`
- `dischargeDate`: DateTime?
- `reason`: String?
- `status`: Enum `AdmissionStatus` (`ADMITTED`, `DISCHARGED`, `CANCELLED`), default `ADMITTED`
- `patient`: `Patient @relation(fields: [patientId], references: [id])`
- `bed`: `Bed @relation(fields: [bedId], references: [id])`
- `createdAt`: DateTime, `@default(now())`
- `updatedAt`: DateTime, `@updatedAt`
- Indexes: `@@index([patientId])`, `@@index([bedId])`, `@@index([status])`

### Shared Model Updates
- In `Patient` model: Add `admissions Admission[]` relation field without modifying any existing fields or attributes.

## 4. Concurrency & Business Rules

1. **Admission Creation**:
   - Verify patient exists.
   - Verify patient does not already have an active admission (`status: "ADMITTED"`).
   - Verify bed exists and status is `AVAILABLE` (reject `MAINTENANCE` and `OCCUPIED`).
   - Run inside `prisma.$transaction`.
   - Concurrency guard: Perform conditional update on Bed (`updateMany where id = bedId and status = 'AVAILABLE' set status = 'OCCUPIED'`). If `count === 0`, bed was claimed concurrently—abort and return 409 Conflict.
   - Create admission record with `status: "ADMITTED"`.
2. **Discharge**:
   - Verify admission exists and is currently `ADMITTED`.
   - Run inside `prisma.$transaction`.
   - Update admission: set `status = 'DISCHARGED'` and `dischargeDate = new Date()`.
   - Update bed: set `status = 'AVAILABLE'` for the associated bed.
   - Guard against duplicate discharges.

## 5. Ten-Milestone Implementation Plan

| Milestone | Commit Message | Scope |
|---|---|---|
| 1 | `docs: add bed and admissions implementation plan` | Architecture audit, dependencies, and implementation plan document |
| 2 | `feat: add ward and bed database models` | Prisma schema addition for Ward & Bed, enums, migration generation and verification |
| 3 | `feat: implement ward management APIs` | Ward routes, controller, service (`POST /api/wards`, `GET /api/wards`), validation |
| 4 | `feat: implement bed management APIs` | Bed routes, controller, service (`POST`, `GET`, `GET /:id`, `PATCH /:id`, `GET /available`, filters) |
| 5 | `feat: add admission database model` | Prisma schema addition for Admission model, relations, migration generation and verification |
| 6 | `feat: implement transactional patient admission` | Admission creation route, controller, service with Prisma transaction & concurrency lock |
| 7 | `feat: implement admission retrieval and updates` | Admission list, details by ID, `/active`, patient filter, and metadata update |
| 8 | `feat: implement transactional patient discharge` | Patient discharge endpoint (`PATCH /api/admissions/:id/discharge`) with atomic bed release |
| 9 | `test: add bed and admissions API test collection` | Insomnia v4 test collection export covering all required health, ward, bed, and admission flows |
| 10 | `docs: finalize bed and admissions integration` | Integration verification, full API documentation, migration guide, and project handover |

## 6. Integration Conflict Prevention

- **Never delete or modify existing files** unless strictly required for route mounting (`app.js`) or Prisma relations (`schema.prisma`).
- **Never modify existing migrations** (`20261113190638_init_patient_opd`).
- **Never expose credentials or `.env`** in git commits.
- **Run comprehensive tests** before every commit and ensure zero regressions on the existing Patient Management module.
