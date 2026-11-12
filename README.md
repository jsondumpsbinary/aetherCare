# AetherCare

### Connected Healthcare. Smarter Operations.

AetherCare is a desktop-based hospital management and resource coordination application built to simplify hospital operations through a centralized digital platform.

Built with **Electron.js**, **React**, **Express.js**, **Prisma ORM**, and **PostgreSQL**, AetherCare provides a unified interface for managing patient records, OPD queues, bed availability, patient admissions, and medical inventory.

---

## Tech Stack

| Technology | Role & Usage |
|---|---|
| **Electron.js** | Desktop Application (Packaging, Native Window, App Lifecycle) |
| **React** | User Interface (Forms, Tables & Navigation) |
| **Express.js** | Backend API (Routing, Middleware & Authentication) |
| **Prisma ORM** | Object-Relational Mapping (Database Queries, Models, Relations & Transactions) |
| **PostgreSQL** | Relational Database (Persistent Data, Queue, Bed Status & Stock Tracking) |
| **bcrypt + JWT** | Security (Password Hashing, Token Generation & Role-based Access) |

---

## 1. System Architecture

AetherCare follows a tiered architecture connecting a desktop frontend with an Express API backend and a Prisma-managed PostgreSQL database:

```text
┌────────────────────────────────────────────────────────┐
│             Electron.js (Desktop Application)          │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                 React (User Interface)                 │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│         Express.js (API, Routing & Authentication)     │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│          Prisma ORM (Database Queries & Models)        │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│               PostgreSQL (Persistent Data)             │
└────────────────────────────────────────────────────────┘
```

- **Electron.js:** Wraps the web application in a cross-platform native desktop window and manages app lifecycle.
- **React:** Delivers the interactive user interface, forms, data tables, and client-side routing.
- **Express.js:** Exposes RESTful API routes, handles business logic, runs middleware, and manages authentication.
- **Prisma ORM:** Manages data schemas, type-safe queries, relation mapping, and database transactions.
- **PostgreSQL:** Persistently stores core hospital data, queue states, bed statuses, and inventory records.

---

## 2. Core Feature Modules

The MVP application is structured into 5 core modules protected by role-based authentication:

```mermaid
flowchart TD
    Start([Launch AetherCare]) --> Login[Login / Authentication]
    Login --> Valid{Valid Credentials?}
    Valid -- No --> Login
    Valid -- Yes --> App[Main Application / Role-based Access]
    
    App --> M1[Patient Management]
    App --> M2[OPD Management]
    App --> M3[Bed Management]
    App --> M4[Admissions]
    App --> M5[Inventory Management]
```

### Module Breakdown:

- **Authentication & Access Control**
  - Secure credential login (`bcrypt` + `JWT`)
  - Role-based application access

- **Patient Management**
  - Register Patient (Capture essential patient details)
  - View / Search patient records
  - Update patient details

- **OPD Management**
  - Create OPD Visit
  - Generate Token
  - Manage Queue
  - Update Status (`Waiting` → `In Consultation` → `Completed`)

- **Bed Management**
  - View Bed Availability
  - Filter by Category (Ward/Type)
  - Reserve / Assign beds
  - Update Bed Status

- **Admissions**
  - Create Admission
  - Assign Bed
  - Track Admission status
  - Discharge Patient
  - Release Bed

- **Inventory Management**
  - Add Medicines
  - Update Stock
  - Issue / Adjust Stock
  - Low-stock Alerts

---

## 3. Complete Patient Workflow (End-to-End Flow)

The typical patient journey through AetherCare:

```mermaid
flowchart TD
    A[1. Register Patient<br/><i>Add patient details</i>] --> B[2. OPD Visit<br/><i>Create visit & generate token</i>]
    B --> C[3. Consultation<br/><i>Queue: Waiting → In Consultation → Completed</i>]
    C --> D{4. Admission Required?}
    D -- No --> E([End Visit<br/><i>OPD Completed</i>])
    D -- Yes --> F[5. Check Bed Availability<br/><i>View and select available bed</i>]
    F --> G[6. Admit Patient<br/><i>Create admission & assign bed</i>]
    G --> H[7. Manage Treatment<br/><i>Update medicine stock if issued</i>]
    H --> I[8. Discharge Patient<br/><i>Release bed & close admission</i>]
```

1. **Register Patient:** Record patient demographic and basic details.
2. **OPD Visit:** Schedule an outpatient visit and generate a queue token.
3. **Consultation:** Doctor consultation with live queue tracking (`Waiting` → `In Consultation` → `Completed`).
4. **Admission Required?:** Decision point based on consultation results.
   - If **No**: Complete visit and conclude OPD journey.
   - If **Yes**: Initiate inpatient admission sequence.
5. **Check Bed Availability:** Inspect real-time bed capacity and select an available bed by ward/category.
6. **Admit Patient:** Create formal admission record and allocate the selected bed.
7. **Manage Treatment:** Issue prescribed medications and automatically adjust medicine stock in inventory.
8. **Discharge Patient:** Process discharge, update admission status, and release bed back to available pool.

---

## 4. Tech Used per Feature

| Feature | Technologies / Concepts |
|---|---|
| **Authentication** | React, Express (Routes & Middleware), Prisma, PostgreSQL, (bcrypt + JWT) |
| **Patient Management** | React (Forms & Tables), Express CRUD Routes, Prisma Models |
| **OPD Management** | React, Express Routes, Prisma (Relations), PostgreSQL (Token & Queue) |
| **Bed Management** | React, Express, Prisma (Transactions), PostgreSQL (Bed Status) |
| **Admissions** | React, Express, Prisma (Relations & Transactions), PostgreSQL |
| **Inventory Management** | React, Express, Prisma (CRUD), PostgreSQL (Stock Tracking & Low-stock Check) |
| **Desktop Application** | Electron (Packaging, Native Window, App Lifecycle) |

---

## 5. Development Roadmap (4 Days)

```mermaid
flowchart LR
    D1[Day 1: Setup & Foundation] --> D2[Day 2: Core Modules Part 1]
    D2 --> D3[Day 3: Core Modules Part 2]
    D3 --> D4[Day 4: Integration & Testing]
```

### Day 1: Setup & Foundation
- [x] Setup Electron + React
- [x] Setup Express server
- [x] Connect Prisma with PostgreSQL
- [x] Create database schema
- [x] Implement Login (Authentication)

### Day 2: Core Modules (Part 1)
- [x] Patient Management (CRUD)
- [x] OPD Management (Create visit & token)
- [x] Basic UI & navigation

### Day 3: Core Modules (Part 2)
- [x] Bed Management (availability & reservation)
- [x] Admissions (admit, assign bed, discharge)
- [x] Inventory Management (medicine & stock updates)
- [x] Integrate all modules

### Day 4: Integration & Testing
- [x] End-to-end workflow testing (`Patient` → `OPD` → `Admission` → `Discharge`)
- [x] Fix bugs and polish UI
- [x] Add demo data
- [x] Prepare final build and documentation

---

## 6. Project Structure

```text
aethercare/
├── electron/
│   ├── main.js                 # Electron main process & window management
│   └── preload.js              # Safe desktop bridge
│
├── server/
│   ├── index.js                # Express server entry point
│   ├── routes/                 # Express API routes
│   │   ├── auth.routes.js
│   │   ├── patients.routes.js
│   │   ├── opd.routes.js
│   │   ├── beds.routes.js
│   │   ├── admissions.routes.js
│   │   └── inventory.routes.js
│   └── middleware/             # Auth & error handling middlewares
│
├── prisma/
│   ├── schema.prisma           # Prisma data models & relations
│   └── migrations/             # Database migrations
│
├── src/
│   ├── components/             # Reusable UI components
│   ├── pages/                  # Module pages
│   │   ├── Login/
│   │   ├── Patients/
│   │   ├── OPD/
│   │   ├── Beds/
│   │   ├── Admissions/
│   │   └── Inventory/
│   ├── services/               # API client services
│   ├── App.jsx
│   └── main.jsx
│
├── .env.example
├── package.json
└── README.md
```

---

## 7. Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/)
- [PostgreSQL](https://www.postgresql.org/)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/aethercare.git
cd aethercare
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment configuration
Create a `.env` file in the project root:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/aethercare?schema=public"
JWT_SECRET="your-jwt-secret-key"
PORT=5000
```

### 4. Database initialization (Prisma)
Run Prisma migrations to create the database schema:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Launch the application
Start the development server and Electron desktop application:
```bash
npm run dev
```

---

<p align="center">
  <strong>AetherCare</strong><br/>
  Hospital Management System (MVP)
</p>
