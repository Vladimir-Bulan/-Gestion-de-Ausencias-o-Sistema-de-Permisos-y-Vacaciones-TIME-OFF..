# Wizdaa Time Off Management / Gestión de Licencias

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![GraphQL](https://img.shields.io/badge/GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)

**EN:** A fullstack Time Off Management application built with NestJS, GraphQL, PostgreSQL, Prisma, React, and TypeScript. Employees can submit leave requests, managers can approve or reject them, and balances are tracked automatically.

**ES:** Aplicación fullstack de Gestión de Licencias construida con NestJS, GraphQL, PostgreSQL, Prisma, React y TypeScript. Los empleados pueden enviar solicitudes de ausencia, los managers pueden aprobarlas o rechazarlas, y los saldos se actualizan automáticamente.

---

## Screenshots / Capturas

> Dashboard · Employees / Empleados · Requests / Solicitudes

## Dashboard
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/1c8ad90c-cb1a-47eb-8b3e-a10d001a9a75" />

## Employees
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/c2a459b8-d09f-4607-944e-baa562d4c041" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/3dacd882-3032-432e-9d31-25530ad393cf" />

## Requests 
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/02dd46c6-d3a4-40af-9b25-8ff0d92b5752" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/a150e63d-3464-4643-bd7c-a79f4b40e625" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/b1cbde22-b49e-4719-9d3e-8ccd100cd34a" />

## My Requests 
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/a717dd82-8098-4713-b96b-ebdebd9dae74" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/cced9138-a7fc-4f8f-9891-a77d74f11c19" />

---

## Live Demo / Demo en vivo

- Backend GraphQL Playground: `http://localhost:3000/graphql`
- Frontend: `http://localhost:5173`

---

## Architecture / Arquitectura

```
wizdaa-time-off/                 (monorepo root / raíz del monorepo)
├── src/                         Backend (NestJS + GraphQL + Prisma)
│   ├── common/
│   │   ├── exceptions/          Clases de excepciones ligeras
│   │   ├── filters/             Filtro global de excepciones GraphQL
│   │   ├── types/               Tipos de dominio (desacoplados de Prisma)
│   │   └── utils/               Utilidades (cálculo de días hábiles)
│   ├── prisma/                  PrismaService
│   └── modules/
│       ├── employees/           CRUD de empleados (resolver, service, repository)
│       ├── time-off-requests/   Ciclo de vida de solicitudes
│       └── leave-balance/       Seguimiento de saldo de licencias
├── prisma/                      Esquema y migraciones
├── frontend/                    SPA React (Vite + TypeScript)
│   ├── src/
│   └── package.json
├── package.json                 Dependencias y scripts del backend
└── docker-compose.yml           Contenedor PostgreSQL
```

**Design decisions / Decisiones de diseño:**

- **Repository pattern** — la capa de datos está aislada; los servicios nunca tocan Prisma directamente
- **Domain types** — desacoplados del cliente generado por Prisma para mayor testabilidad (DIP)
- **Single Responsibility** — cada clase tiene una única razón para cambiar
- **Pure unit tests** — servicios testeados con mocks puros, sin contenedor DI de NestJS

---

## Tech Stack / Stack Tecnológico

| Layer / Capa | Technology / Tecnología             |
|--------------|-------------------------------------|
| Runtime      | Node.js + TypeScript                |
| Backend      | NestJS                              |
| API          | GraphQL (Apollo Server, code-first) |
| ORM          | Prisma                              |
| Database     | PostgreSQL                          |
| Frontend     | React + Vite + TypeScript           |
| Testing      | Jest                                |

---

## Prerequisites / Requisitos

- Node.js 18+
- npm

---

## Setup / Instalación

### Backend

```bash
# Install dependencies / Instalar dependencias
npm install

# Configure environment / Configurar entorno
cp .env.example .env
# Note: pre-configured for Neon cloud PostgreSQL — skip docker-compose
# Nota: preconfigurado para PostgreSQL en la nube (Neon) — omitir docker-compose

# Generate Prisma client and run migrations
# Generar cliente Prisma y ejecutar migraciones
npx prisma generate
npx prisma migrate dev

# (Optional) Seed with sample data / (Opcional) Cargar datos de prueba
npx prisma db seed

# Start development server / Iniciar servidor de desarrollo
npm run start:dev
```

Backend: **http://localhost:3000**
GraphQL Playground: **http://localhost:3000/graphql**

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: **http://localhost:5173**

---

## Running Tests / Ejecutar Tests

```bash
# All tests / Todos los tests
npm test

# With coverage / Con cobertura
npm run test:cov
```

---

## GraphQL API Reference / Referencia de la API

### Queries / Consultas

```graphql
# Get all employees / Obtener todos los empleados
query {
  employees {
    id
    name
    email
    role
    managerId
  }
}

# Get employee with direct reports / Empleado con sus reportes directos
query {
  employee(id: "uuid") {
    id
    name
    email
    role
    reports { id name }
  }
}

# Get time off requests / Obtener solicitudes de licencia (con filtros opcionales)
query {
  timeOffRequests(filters: { status: "PENDING" }) {
    id
    type
    startDate
    endDate
    totalDays
    status
    reason
    employee { name email }
  }
}

# Get leave balance / Obtener saldo de licencias
query {
  leaveBalance(employeeId: "uuid") {
    vacationDays
    sickDays
    personalDays
    year
  }
}
```

### Mutations / Mutaciones

```graphql
# Create employee / Crear empleado
mutation {
  createEmployee(input: {
    name: "Alice Johnson"
    email: "alice@wizdaa.com"
    role: EMPLOYEE
    managerId: "manager-uuid"
  }) { id name email }
}

# Submit time off request / Enviar solicitud de licencia
mutation {
  createTimeOffRequest(input: {
    employeeId: "uuid"
    type: VACATION
    startDate: "2025-07-01"
    endDate: "2025-07-05"
    reason: "Vacaciones de verano"
  }) { id status totalDays }
}

# Approve or reject / Aprobar o rechazar (solo managers)
mutation {
  reviewTimeOffRequest(input: {
    requestId: "uuid"
    reviewedById: "manager-uuid"
    decision: "APPROVE"
    reviewNote: "Aprobado. ¡Que lo disfrutes!"
  }) { id status reviewNote }
}

# Cancel request / Cancelar solicitud
mutation {
  cancelTimeOffRequest(
    requestId: "uuid"
    employeeId: "uuid"
  ) { id status }
}
```

---

## Business Rules / Reglas de Negocio

| Rule / Regla                  | Details / Detalles                                                              |
|-------------------------------|---------------------------------------------------------------------------------|
| No past dates / Sin fechas pasadas | Las solicitudes no pueden comenzar en el pasado                            |
| Date order / Orden de fechas  | La fecha de inicio debe ser anterior o igual a la fecha de fin                  |
| Weekends excluded / Sin fines de semana | Sábados y domingos se excluyen del conteo de días hábiles             |
| No overlaps / Sin solapamientos | Solicitudes PENDING o APPROVED no pueden solaparse para el mismo empleado     |
| Balance check / Control de saldo | El empleado debe tener saldo suficiente (UNPAID siempre permitido)           |
| Role-based review / Revisión por rol | Solo MANAGER o ADMIN pueden aprobar o rechazar                          |
| No self-review / Sin auto-revisión | Los empleados no pueden revisar sus propias solicitudes                   |
| Balance restore / Restauración de saldo | Cancelar una solicitud APPROVED restaura los días descontados         |

---

## Leave Types / Tipos de Licencia

| Type / Tipo | Annual Allowance / Días anuales |
|-------------|----------------------------------|
| VACATION / Vacaciones | 15 días              |
| SICK / Enfermedad     | 10 días              |
| PERSONAL              | 5 días               |
| UNPAID / Sin goce     | Ilimitado            |

---

## Author / Autor

**Alexander Vladimir Bulan Georgieff**
