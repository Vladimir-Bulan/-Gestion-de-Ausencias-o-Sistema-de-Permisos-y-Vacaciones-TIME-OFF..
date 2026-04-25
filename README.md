# Wizdaa Time Off Management

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![GraphQL](https://img.shields.io/badge/GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)

A fullstack **Time Off Management** application built with **NestJS**, **GraphQL**, **PostgreSQL**, **Prisma**, **React**, and **TypeScript**. Employees can submit leave requests, managers can approve or reject them, and balances are tracked automatically.

## Screenshots

> Dashboard · Employees · Requests

![Dashboard](./docs/screenshots/dashboard.png)
![Employees](./docs/screenshots/employees.png)
![Requests](./docs/screenshots/requests.png)

## Live Demo
- Backend GraphQL Playground: `http://localhost:3000/graphql`
- Frontend: `http://localhost:5173`

## Architecture

\`\`\`
wizdaa-time-off/                 (monorepo root)
├── src/                         Backend (NestJS + GraphQL + Prisma)
│   ├── common/
│   │   ├── exceptions/          Lightweight exception classes
│   │   ├── filters/             Global GraphQL exception filter
│   │   ├── types/               Domain types (decoupled from Prisma)
│   │   └── utils/               Utilities (date calculations)
│   ├── prisma/                  PrismaService
│   └── modules/
│       ├── employees/           Employee CRUD (resolver, service, repository)
│       ├── time-off-requests/   Request lifecycle management
│       └── leave-balance/       Leave balance tracking
├── prisma/                      Schema & migrations
├── frontend/                    React SPA (Vite + TypeScript)
│   ├── src/
│   └── package.json
├── package.json                 Backend dependencies & scripts
└── docker-compose.yml           PostgreSQL container
\`\`\`

**Design decisions:**

- **Repository pattern** — data access is isolated; services never touch Prisma directly
- **Domain types** — decoupled from Prisma's generated client for testability and DIP compliance
- **Single Responsibility** — each class has one reason to change
- **Pure unit tests** — services tested with plain mocks, no NestJS DI container needed

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Runtime    | Node.js + TypeScript                |
| Backend    | NestJS                              |
| API        | GraphQL (Apollo Server, code-first) |
| ORM        | Prisma                              |
| Database   | PostgreSQL                          |
| Frontend   | React + Vite + TypeScript           |
| Testing    | Jest                                |

## Prerequisites

- Node.js 18+
- npm

## Setup

### Backend

\`\`\`bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Note: The project is pre-configured to use a cloud PostgreSQL database (Neon).
# Skip docker-compose and run Prisma directly.

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev

# (Optional) Seed with sample data
npx prisma db seed

# Start development server (with hot reload)
npm run start:dev
\`\`\`

The backend runs at **http://localhost:3000**
GraphQL Playground: **http://localhost:3000/graphql**

### Frontend

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

Frontend runs at **http://localhost:5173**

## Running Tests

\`\`\`bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:cov
\`\`\`

## GraphQL API Reference

### Queries

\`\`\`graphql
# Get all employees
query {
  employees {
    id name email role managerId
  }
}

# Get a single employee with their direct reports
query {
  employee(id: "uuid") {
    id name email role
    reports { id name }
  }
}

# Get all time off requests (with optional filters)
query {
  timeOffRequests(filters: { status: "PENDING" }) {
    id type startDate endDate totalDays status reason
    employee { name email }
  }
}

# Get leave balance for an employee
query {
  leaveBalance(employeeId: "uuid") {
    vacationDays sickDays personalDays year
  }
}
\`\`\`

### Mutations

\`\`\`graphql
# Create a new employee
mutation {
  createEmployee(input: {
    name: "Alice Johnson"
    email: "alice@wizdaa.com"
    role: EMPLOYEE
    managerId: "manager-uuid"
  }) { id name email }
}

# Submit a time off request
mutation {
  createTimeOffRequest(input: {
    employeeId: "employee-uuid"
    type: VACATION
    startDate: "2025-07-01"
    endDate: "2025-07-05"
    reason: "Summer vacation"
  }) { id status totalDays }
}

# Approve or reject a request (managers/admins only)
mutation {
  reviewTimeOffRequest(input: {
    requestId: "request-uuid"
    reviewedById: "manager-uuid"
    decision: "APPROVE"
    reviewNote: "Approved, enjoy your time off!"
  }) { id status reviewNote }
}

# Cancel a request (restores balance if previously approved)
mutation {
  cancelTimeOffRequest(
    requestId: "request-uuid"
    employeeId: "employee-uuid"
  ) { id status }
}
\`\`\`

## Business Rules

| Rule                  | Details                                                              |
|-----------------------|----------------------------------------------------------------------|
| No past dates         | Requests cannot start in the past                                    |
| Date order            | Start date must be on or before the end date                         |
| Weekends excluded     | Weekends (Sat/Sun) are excluded from the total working days count    |
| No overlaps           | PENDING or APPROVED requests cannot overlap for the same employee    |
| Balance check         | Employee must have enough leave balance (UNPAID is always allowed)   |
| Role-based review     | Only MANAGER or ADMIN roles can approve or reject requests           |
| No self-review        | Employees cannot review their own requests                           |
| Balance restore       | Cancelling an APPROVED request restores the previously deducted days |

## Leave Types

| Type       | Annual Allowance |
|------------|------------------|
| VACATION   | 15 days          |
| SICK       | 10 days          |
| PERSONAL   | 5 days           |
| UNPAID     | Unlimited        |

## Author

**Alexander Vladimir Bulan Georgieff**
