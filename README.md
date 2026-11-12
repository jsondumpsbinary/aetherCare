
# AetherCare
### Connected Healthcare. Smarter Operations.

AetherCare is a desktop-based Hospital Management System (MVP) designed to simplify hospital operations through a centralized digital platform.

It provides an integrated solution for managing patients, OPD visits, doctor queues, bed availability, patient admissions, and medical inventory.

Built using Electron.js, React.js, Express.js, Prisma ORM, and PostgreSQL, AetherCare aims to improve hospital workflow efficiency and resource coordination.

## Overview

Hospitals manage multiple interconnected operations, including patient registration, outpatient consultations, bed allocation, admissions, and medicine inventory.

Managing these operations manually or through disconnected systems can result in delays, inefficient resource utilization, and difficulties in maintaining accurate records.

AetherCare addresses these challenges by bringing essential hospital operations into a single desktop application.

The MVP focuses on five core modules:

- Patient Management
- OPD Management
- Bed Management
- Admissions Management
- Inventory Management

## Features

### 1. Patient Management
- Register new patients.
- View and search patient records.
- Update patient details.
- Maintain centralized patient information.

### 2. OPD Management
- Create OPD visits for registered patients.
- Automatically generate OPD tokens.
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
- Role-based access to application modules.
- Password hashing and JWT-based authentication.

## Technology Stack

| Technology | Usage |
|---|---|
| Electron.js | Desktop application framework |
| React.js | User interface |
| Express.js | Backend API and routing |
| Prisma ORM | Database queries and data models |
| PostgreSQL | Relational database |
| JavaScript | Application logic |
| bcrypt | Password hashing |
| JWT | Authentication |

## System Architecture

AetherCare follows a layered architecture that separates the desktop application, user interface, backend services, and database operations.

```text
       AetherCare Desktop Application
                    |
                Electron.js
                    |
                 React.js
               (User Interface)
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
- **Express.js:** Manages backend APIs, routing, and authentication middleware.
- **Prisma ORM:** Handles database queries, models, and relationships.
- **PostgreSQL:** Stores persistent patient, OPD, bed, admission, and inventory data.

## Application Workflow

A typical patient workflow within AetherCare follows these steps:

```text
          Start Application
                  |
                  v
                Login
                  |
                  v
          Credential Validation
                  |
                  v
           Main Application
                  |
                  v
          Register Patient
                  |
                  v
              OPD Visit
                  |
                  v
           Generate Token
                  |
                  v
         Doctor Consultation
                  |
                  v
          Admission Required?
              /       \
            No         Yes
            |           |
            v           v
        End Visit   Check Bed Availability
                        |
                        v
                  Assign Available Bed
                        |
                        v
                   Admit Patient
                        |
                        v
                  Manage Treatment
                        |
                        v
                 Update Inventory
                        |
                        v
                Discharge Patient
                        |
                        v
                   Release Bed
```

The modules work together to maintain consistency between patient records, OPD visits, bed allocation, admissions, and inventory operations.

## Installation

### Prerequisites

Ensure the following are installed on your system:

- Node.js
- npm
- Git
- PostgreSQL

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/aethercare.git
```

### 2. Navigate to the Project Directory

```bash
cd aethercare
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure the Database

Create a PostgreSQL database:

```sql
CREATE DATABASE aethercare;
```

Configure the database connection using the environment variables documented in `.env.example`.

Example:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/aethercare"
```

Replace the credentials with your local PostgreSQL configuration.

### 5. Initialize the Database

Run the configured Prisma database commands to initialize the schema and generate the Prisma Client.

Refer to the project's database setup instructions for the exact migration commands.

### 6. Launch the Application

```bash
npm run start
```

The Electron desktop application should launch once the development environment is configured.

**Note:** Available npm scripts may vary depending on the project's `package.json`.

## Project Structure

The application follows a modular structure to separate individual hospital management operations.

```text
AetherCare/
│
├── electron/
│   ├── main.js
│   └── preload.js
│
├── server/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── index.js
│
├── src/
│   ├── components/
│   ├── pages/
│   │   ├── Dashboard/
│   │   ├── Patients/
│   │   ├── OPD/
│   │   ├── Beds/
│   │   ├── Admissions/
│   │   └── Inventory/
│   │
│   ├── services/
│   ├── assets/
│   ├── App.jsx
│   └── main.jsx
│
├── prisma/
│   └── schema.prisma
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

*The directory structure may evolve as development progresses.*

## Security Considerations

Since hospital management systems handle sensitive patient information, AetherCare considers security and data integrity important aspects of development.

The application incorporates the following security considerations:

- Secure user authentication.
- Password hashing using bcrypt.
- JWT-based authentication.
- Role-based access control.
- Input validation.
- Database operations through Prisma ORM.

Only synthetic patient data should be used for project demonstrations.

## Future Scope

Potential enhancements for future versions include:

- Multi-hospital resource coordination.
- City-wide hospital bed availability tracking.
- Real-time OPD queue updates.
- Improved patient waiting-time estimation.
- Advanced hospital resource management.

## License

This project is developed as an academic software project.

License information will be added when the project license is finalized.

## Acknowledgements

- [Electron.js](https://www.electronjs.org/) — Desktop application framework.
- [React.js](https://react.dev/) — User interface library.
- [Express.js](https://expressjs.com/) — Backend framework.
- [Prisma](https://www.prisma.io/) — Object-relational mapping.
- [PostgreSQL](https://www.postgresql.org/) — Relational database system.
