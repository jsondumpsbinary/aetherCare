# Implementation Plan — Inventory Management & OPD Queue Modules

## 1. Repository Audit Summary

- **Repository**: `https://github.com/jsondumpsbinary/aetherCare.git`
- **Active Branch**: `main`
- **Current State**: Bed and Admissions modules completed and integrated.
- **Existing Tech Stack**:
  - Runtime: Node.js (v25) / Express.js (v5.3.0)
  - ORM: Prisma ORM 7 (`@prisma/client` & `prisma` v7.10.1 with `@prisma/adapter-pg` & `pg`)
  - Database: PostgreSQL (local instance `aethercare` database)
  - Security: `helmet`, `cors`, `bcrypt`, `jsonwebtoken`, `express-rate-limit`
- **Scope of Current Milestone**:
  - Implement the 5th Core Module: **Inventory Management** (Medicine catalogue, stock tracking, restock, dispensation for treatment, adjustments, and low-stock alerts).
  - Complete the **OPD Queue Management & Status Tracking** workflow (`WAITING` → `IN_CONSULTATION` → `COMPLETED`).
  - Maintain 100% backward compatibility and zero regressions across existing Patient, Bed, Admission, and Auth modules.

## 2. Architecture & Design Conventions

The new modules strictly follow the established layered pattern:
- **Routes (`*.routes.js`)**: Clean Express route definitions mapping HTTP verbs to controller methods. Static segments (e.g. `/low-stock`, `/movements`) registered prior to dynamic parameter segments (`/:id`) to prevent shadowing.
- **Controllers (`*.controller.js`)**: Parameter parsing, comprehensive type and boundary validation, invoking services, returning standardized response payload (`{ success: true/false, message, data }`), and mapping known errors (400 Bad Request, 404 Not Found, 409 Conflict, 500 Internal Server Error).
- **Services (`*.service.js`)**: Encapsulates all database interactions, Prisma queries, transaction logic (`prisma.$transaction`), and state machine rules.

## 3. Database Schema Requirements & Relationships

### Medicine Model
- `id`: Int, `@id @default(autoincrement())`
- `name`: String
- `genericName`: String?
- `category`: String?
- `batchNumber`: String
- `expiryDate`: DateTime?
- `currentStock`: Int, `@default(0)`
- `lowStockThreshold`: Int, `@default(10)`
- `unit`: String, `@default("units")`
- `unitPrice`: Float?
- `createdAt`: DateTime, `@default(now())`
- `updatedAt`: DateTime, `@updatedAt`
- `stockMovements`: `StockMovement[]`
- Indexes: `@@index([name])`, `@@index([category])`, `@@index([batchNumber])`, `@@index([currentStock])`

### StockMovement Model
- `id`: Int, `@id @default(autoincrement())`
- `medicineId`: Int
- `patientId`: Int?
- `quantity`: Int
- `movementType`: Enum `StockMovementType` (`RESTOCK`, `DISPENSED`, `ADJUSTMENT`, `DISCARDED`)
- `previousStock`: Int
- `newStock`: Int
- `reason`: String?
- `createdAt`: DateTime, `@default(now())`
- `medicine`: `Medicine @relation(fields: [medicineId], references: [id], onDelete: Cascade)`
- `patient`: `Patient? @relation(fields: [patientId], references: [id])`
- Indexes: `@@index([medicineId])`, `@@index([patientId])`, `@@index([movementType])`, `@@index([createdAt])`

### Shared Model Updates
- In `Patient` model: Add `stockMovements StockMovement[]` relation field without modifying existing fields or attributes.

## 4. Concurrency & Business Rules

1. **Medicine Registration**:
   - Validate `name` and `batchNumber` as non-empty strings.
   - If initial `currentStock > 0`, execute inside `prisma.$transaction` and automatically record an initial `RESTOCK` movement.
2. **Restock Operations**:
   - Validate `quantity > 0`.
   - Atomically increment `currentStock` and record audit log with previous and new stock counts.
3. **Medicine Dispensation / Treatment Issue**:
   - Concurrency guard: Verify `quantity <= currentStock`.
   - Execute conditional update: `updateMany where id = medicineId and currentStock >= quantity set currentStock = currentStock - quantity`.
   - If count is 0, abort transaction with 409 Conflict (Insufficient Stock).
   - If `patientId` is supplied, verify patient existence and associate movement with the patient record.
4. **Stock Adjustments**:
   - Validate `newStock >= 0`.
   - Calculate signed variance and log adjustment movement.
5. **Low-Stock Alerts**:
   - Real-time evaluation of medicines where `currentStock <= lowStockThreshold`.
6. **OPD Consultation Transitions**:
   - Queue status progression: `WAITING` → `IN_CONSULTATION` → `COMPLETED` or `CANCELLED`.
   - Reject unmapped state values with 400 Bad Request.

## 5. Ten-Milestone Implementation Plan

| Milestone | Commit Message | Scope |
|---|---|---|
| 1 | `docs: add inventory and opd queue implementation plan` | Architecture audit, data flow, concurrency rules, and implementation specification |
| 2 | `feat: add medicine and stock movement database models` | Prisma schema additions for Medicine & StockMovement, enums, migration generation and verification |
| 3 | `feat: implement medicine catalogue service and query endpoints` | Medicine catalogue CRUD endpoints (`POST /api/inventory/medicines`, `GET /api/inventory/medicines`, `GET /:id`, `PATCH /:id`) |
| 4 | `feat: implement transactional medicine restock and manual adjustments` | Restock and manual inventory count adjustment endpoints with audit movement records |
| 5 | `feat: implement transactional medicine dispensation for patient treatment` | Patient treatment dispensation endpoint with concurrency lock, stock check, and patient linkage |
| 6 | `feat: implement real-time low-stock alerts and movement audit history` | Real-time threshold-based low stock alerting (`GET /api/inventory/low-stock`) and movement trail |
| 7 | `feat: implement OPD queue retrieval and consultation status transitions` | OPD queue retrieval with filtering (`GET /api/opd-visits`) and status updates (`PATCH /:id/status`) |
| 8 | `feat: integrate inventory and opd routes with role-based access control` | Route mounting in `app.js` with role-based permissions (`allHospitalRoles`, `inventoryManagers`, `opdManagers`) |
| 9 | `test: add automated test suites for inventory opd and e2e workflow` | Automated test suites for Inventory and OPD queue workflows, authenticated E2E verification |
| 10 | `docs: finalize inventory and opd queue integration` | Full API documentation, Insomnia collection export, handover guide, and project verification |

## 6. Integration Conflict Prevention

- **Never modify existing migrations**; append isolated migration `20261115050646_add_inventory_management`.
- **Zero regressions** to existing Patient, Bed, Admission, or Authentication modules.
- **Run comprehensive test suites** and ensure 100% pass rate before push.
