# AetherCare

### Connected Healthcare. Smarter Operations.

AetherCare is a desktop-based hospital management and resource coordination application built to simplify hospital operations through a centralized digital platform.

It provides a unified interface for managing patients, OPD queues, bed availability, patient admissions, pharmacy operations, and medical inventory.

Built with Electron.js, React.js, JavaScript, and PostgreSQL, AetherCare aims to improve operational efficiency, resource utilization, and coordination between hospital departments.

---

## Overview

Hospitals often rely on disconnected systems and manual processes to manage patient flow and medical resources. This can lead to long waiting times, delays in admissions, inaccurate bed availability records, and inefficient inventory management.

AetherCare addresses these challenges by bringing essential hospital operations into a single desktop application.

The project is designed around two primary objectives:

- **Hospital-level management:** Digitize everyday hospital workflows and resource management.
- **Future city-wide integration:** Establish a foundation for sharing relevant resource availability information across multiple hospitals.

## Features

### Patient Management
- Patient registration and record management.
- Unique patient identification.
- Patient search and retrieval.
- Patient visit history.

### OPD Queue Management
- Digital OPD registration.
- Automatic token generation.
- Doctor and department assignment.
- Department-wise queue management.
- Patient status tracking.
- Estimated waiting-time calculation.

### Bed Management
- Centralized bed availability tracking.
- Ward-wise bed categorization.
- Bed reservation and allocation.
- Occupancy status monitoring.
- Bed release after discharge.

### Patient Admission Management
- Admission request creation.
- Patient-to-bed assignment.
- Admission status tracking.
- Patient discharge management.
- Admission history.

### Pharmacy Management
- Medicine catalogue.
- Medicine dispensation records.
- Batch and expiry tracking.
- Automatic stock deduction.
- Dispensing history.

### Inventory Management
- Medicine and consumable tracking.
- Stock addition and adjustment.
- Low-stock notifications.
- Expiry monitoring.
- Inventory transaction history.

---

## Technology Stack

| Technology | Usage |
|---|---|
| Electron.js | Desktop application framework |
| React.js | User interface |
| JavaScript (ES6+) | Application logic |
| Node.js | Main-process runtime |
| PostgreSQL | Relational database |
| Electron IPC | Main and renderer communication |
| Preload Scripts | Secure API bridge |
| CSS3 | Application styling |
| Recharts | Data visualization |
| Lucide React | Interface icons |

### Architecture

AetherCare uses Electron's multi-process architecture to separate the user interface from privileged application operations.

```text
             AetherCare Desktop
                     |
              Electron Window
                     |
              React Renderer
                     |
              Preload Script
                     |
               Electron IPC
                     |
             Electron Main
                 (Node.js)
                     |
             Database Layer
                     |
                PostgreSQL
```

**Architecture responsibilities:**

- **Renderer Process:** Handles the React interface and user interactions.
- **Preload Script:** Exposes controlled application APIs.
- **Main Process:** Handles trusted operations and application lifecycle.
- **IPC:** Facilitates communication between the renderer and main process.
- **Database Layer:** Manages persistent data and database operations.

The application follows a modular architecture to keep individual hospital operations independently maintainable.

---

## Application Workflow

A typical patient workflow within AetherCare:

```text
Patient Registration
        |
        v
    OPD Visit
        |
        v
   Token Generation
        |
        v
 Doctor Consultation
        |
        v
 Admission Required?
        |
        v
  Admission Request
        |
        v
  Bed Availability Check
        |
        v
    Bed Reservation
        |
        v
  Admission Confirmation
        |
        v
   Patient Treatment
        |
        v
 Medicine Dispensation
        |
        v
   Inventory Update
        |
        v
   Patient Discharge
        |
        v
      Bed Release
```

The modules share relevant patient and resource information to maintain consistency across hospital operations.

---

## Installation

### Prerequisites

Ensure the following are installed on your system:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Git](https://git-scm.com/)
- [PostgreSQL](https://www.postgresql.org/)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/aethercare.git
```

### 2. Navigate to the project directory

```bash
cd aethercare
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure the database

Create a PostgreSQL database:

```sql
CREATE DATABASE aethercare;
```

Configure the database connection using the environment variables documented in `.env.example`.

Example:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/aethercare
```

Replace the credentials with your local PostgreSQL configuration.

### 5. Initialize the database

Run the project's configured database migration or schema initialization commands.

Refer to the database setup instructions in the project before running migrations.

### 6. Launch the application

```bash
npm run start
```

The Electron desktop application should launch once the development environment is configured.

> Note: Available npm scripts depend on the project's `package.json`.

---

## Platform Support

AetherCare is being developed as a cross-platform desktop application using Electron.

The intended platforms are:

- macOS
- Windows
- Linux

Platform-specific packaging and testing will be handled as the application develops.

---

## Project Structure

The application is organized into modular components to separate hospital operations and desktop functionality.

```text
AetherCare/
│
├── electron/
│   ├── main.js
│   ├── preload.js
│   └── handlers/
│
├── src/
│   ├── components/
│   ├── pages/
│   │   ├── Dashboard/
│   │   ├── Patients/
│   │   ├── OPD/
│   │   ├── Beds/
│   │   ├── Admissions/
│   │   ├── Pharmacy/
│   │   ├── Inventory/
│   │   └── Reports/
│   │
│   ├── services/
│   ├── hooks/
│   ├── utils/
│   ├── assets/
│   ├── App.jsx
│   └── main.jsx
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── docs/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

The directory structure may evolve as development progresses.

---

## Security Considerations

Healthcare applications handle sensitive information. Security and data integrity are important design considerations for AetherCare.

The application should incorporate:

- Secure authentication.
- Role-based access control.
- Password hashing.
- Input validation.
- Parameterized database queries.
- Secure Electron configuration.
- Audit logging.
- Database backups.
- Appropriate protection of patient information.

Only synthetic data should be used for project demonstrations.

---

## Future Scope

AetherCare is designed with the possibility of future expansion.

Potential enhancements include:

- City-wide hospital coordination.
- Multi-hospital resource availability.
- Real-time OPD queue updates.
- Advanced waiting-time estimation.
- Medicine consumption forecasting.
- Advanced hospital analytics.
- Patient-facing mobile application.
- Integration with existing healthcare infrastructure.
- Standardized healthcare data exchange.

---

## License

This project is developed as an academic software project.

License information will be added when the project license is finalized.

---

## Acknowledgements

- [Electron](https://www.electronjs.org/) — Cross-platform desktop application framework.
- [React](https://react.dev/) — User interface library.
- [PostgreSQL](https://www.postgresql.org/) — Relational database system.
- [Lucide](https://lucide.dev/) — Icon library.
- [Recharts](https://recharts.org/) — Data visualization library.

---

<p align="center">
  <strong>AetherCare</strong><br/>
  Connected Healthcare. Smarter Operations.
</p>