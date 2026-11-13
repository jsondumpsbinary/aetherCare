# AetherCare
### Connected Healthcare. Smarter Operations.

AetherCare is a desktop-oriented Hospital Management System (MVP) designed to simplify hospital operations through a centralized digital platform.

The project aims to bring essential hospital workflows—including patient registration, OPD management, doctor queues, bed allocation, admissions, and medical inventory—into one integrated application.

Built using **React.js, Electron.js, Express.js, Prisma ORM, and PostgreSQL**, AetherCare focuses on improving hospital workflow efficiency and resource coordination.

---

## Overview

Hospitals manage several interconnected operations, including patient registration, outpatient consultations, bed allocation, admissions, and medicine inventory.

Manual processes and disconnected systems can lead to operational delays, inefficient resource utilization, and difficulties maintaining accurate records.

AetherCare aims to address these challenges by providing a centralized platform for managing essential hospital operations.

### Core Modules

1. Patient Management
2. OPD Management
3. Bed Management
4. Admissions Management
5. Inventory Management

---

## Current Development Status

The project is currently in its initial development phase.

| Component | Status |
|---|---|
| React + Vite frontend setup | Implemented |
| Express backend setup | Implemented |
| Backend health-check endpoint | Implemented |
| PostgreSQL database setup | Implemented |
| Prisma 7 configuration | Implemented |
| Patient database model | Implemented |
| Department database model | Implemented |
| Doctor database model | Implemented |
| OPD visit database model | Implemented |
| Patient registration APIs | Planned |
| OPD token generation and queue APIs | Planned |
| Authentication and access control | Planned |
| Bed and admissions management | Planned |
| Inventory management | Planned |
| Electron desktop integration | Planned |

---

## Technology Stack

| Technology | Purpose |
|---|---|
| Electron.js | Desktop application framework |
| React.js | Frontend user interface |
| Vite | Frontend development and build tooling |
| Express.js | Backend API and routing |
| Prisma ORM 7 | Database schema and queries |
| PostgreSQL | Relational database |
| Node.js | Backend runtime |
| JavaScript | Application logic |
| bcrypt | Password hashing (planned) |
| JSON Web Tokens | Authentication (planned) |

---

## System Architecture

AetherCare follows a layered architecture that separates the user interface, backend logic, and database operations.

```text
       AetherCare Desktop Application
                    |
                Electron.js
                    |
                 React.js
              (User Interface)
                    |
               HTTP Requests
                    |
                Express.js
               (Backend API)
                    |
                Prisma ORM
              (Database Layer)
                    |
               PostgreSQL
             (Persistent Data)
```

### Architecture Responsibilities

- **Electron.js:** Provides the desktop application environment.
- **React.js:** Handles the user interface and user interactions.
- **Express.js:** Manages backend APIs, routing, and request handling.
- **Prisma ORM:** Manages database models, relationships, and queries.
- **PostgreSQL:** Stores persistent application data.

---

## Database Design

The current Prisma schema contains four primary models:

| Model | Responsibility |
|---|---|
| Patient | Stores patient information and registration details |
| Department | Maintains hospital departments |
| Doctor | Stores doctor information and department associations |
| OPDVisit | Maintains patient OPD visits, tokens, and visit status |

### Entity Relationships

- A patient can have multiple OPD visits.
- A department can have multiple doctors.
- A department can have multiple OPD visits.
- A doctor belongs to a department.
- An OPD visit is associated with a patient, doctor, and department.

The database schema is designed to support the patient-to-OPD workflow and can be extended as additional modules are developed.

---

## Planned Features

### 1. Patient Management
- Register new patients.
- View and search patient records.
- Update patient details.
- Maintain centralized patient information.

### 2. OPD Management
- Create OPD visits for registered patients.
- Generate OPD tokens.
- Manage patient queues.
- Track and update visit status.

### 3. Bed Management
- View available beds.
- Filter beds by category.
- Reserve and assign beds to patients.
- Update bed availability and occupancy status.

### 4. Admissions Management
- Create patient admission records.
- Assign available beds to admitted patients.
- Track admission status.
- Manage patient discharge.
- Release beds after discharge.

### 5. Inventory Management
- Add medicines to inventory.
- Update medicine stock.
- Issue and adjust stock quantities.
- Monitor inventory levels.
- Generate low-stock alerts.

### 6. Authentication & Access Control
- Secure user login.
- Credential validation.
- Role-based access control.
- Password hashing and JWT-based authentication.

---

## Project Structure

The current repository is organized into separate frontend and backend applications.

```text
AetherCare/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── ...
│   └── package.json
│
├── server/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── modules/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── prisma7.config.ts
│   └── package.json
│
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

*The directory structure will evolve as additional modules are implemented.*

---

## Installation and Setup

### Prerequisites

Ensure the following are installed:

- Node.js
- npm
- Git
- PostgreSQL

### 1. Clone the Repository

```bash
git clone https://github.com/jsondumpsbinary/aetherCare.git
cd aetherCare
```

### 2. Install Root Dependencies

```bash
npm install
```

### 3. Install Frontend Dependencies

```bash
cd client
npm install
cd ..
```

### 4. Install Backend Dependencies

```bash
cd server
npm install
```

### 5. Configure Environment Variables

Create a `.env` file inside the `server/` directory.

```env
DATABASE_URL="postgresql://username:password@localhost:5432/aethercare_db?schema=public"
PORT=5000
```

Replace the database credentials with your local PostgreSQL configuration.

**Important:** Never commit `.env` files or expose database credentials.

### 6. Create the Database

Create the PostgreSQL database:

```sql
CREATE DATABASE aethercare_db;
```

### 7. Apply Database Migrations

From the `server/` directory, run:

```bash
npx prisma migrate deploy
npx prisma generate
```

For development, when creating new schema changes, use:

```bash
npx prisma migrate dev --name migration_name
```

### 8. Start the Development Environment

From the project root:

```bash
npm run dev
```

This starts the frontend and backend development servers concurrently.

| Application | Development URL |
|---|---|
| React frontend | http://localhost:5173 |
| Express backend | http://localhost:5000 |
| API health check | http://localhost:5000/api/health |

The health-check endpoint can be used to verify that the backend is running.

---

## Development Approach

The backend follows a modular, layered structure:

```text
Routes → Controllers → Services → Prisma → PostgreSQL
```

- **Routes:** Define API endpoints.
- **Controllers:** Handle HTTP requests and responses.
- **Services:** Contain application logic and database operations.
- **Prisma:** Communicates with PostgreSQL.

This structure keeps the application modular and makes individual hospital management modules easier to maintain.

---

## Security Considerations

Since hospital management systems handle sensitive patient information, security and data integrity are important development considerations.

Planned security measures include:

- Secure user authentication.
- Password hashing using bcrypt.
- JWT-based authentication.
- Role-based access control.
- Input validation.
- Database operations through Prisma ORM.

Only synthetic patient data should be used for project demonstrations.

---

## Future Scope

Potential enhancements include:

- Multi-hospital resource coordination.
- City-wide hospital bed availability tracking.
- Real-time OPD queue updates.
- Improved patient waiting-time estimation.
- Advanced hospital resource management.

---

## License

This project is developed as an academic software project.

License information will be added when the project license is finalized.

---

## Acknowledgements

- [Electron.js](https://www.electronjs.org/) — Desktop application framework.
- [React.js](https://react.dev/) — User interface library.
- [Vite](https://vite.dev/) — Frontend development tooling.
- [Express.js](https://expressjs.com/) — Backend framework.
- [Prisma](https://www.prisma.io/) — Object-relational mapping.
- [PostgreSQL](https://www.postgresql.org/) — Relational database system.
