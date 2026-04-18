# PAS Blind Matching System

A web app that anonymously matches students with supervisors based on research interests — removing bias from the selection process.

---

## What It Does

- Students submit project proposals
- Supervisors review proposals **blindly** (no student names visible)
- The system matches students to supervisors based on research area preferences
- Module leaders manage users, research areas, and trigger the matching process

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | ASP.NET Core 8 Web API, Entity Framework Core |
| Database | SQL Server (LocalDB / SQLEXPRESS) |
| Auth | JWT Bearer Tokens |
| API Docs | Swagger UI (`/swagger`) |

---

## Project Structure

```
/blind-match-system-main   → Frontend (React/Vite)
/BlindMatchAPI             → Backend (ASP.NET Core API)
```

---

## How to Run

### 1. Clone the repo

```bash
git clone https://github.com/hkdskavikeshawa/PAS-Blind-Matching-System.git
cd PAS-Blind-Matching-System
```

### 2. Configure the database

Open `BlindMatchAPI/appsettings.json` and update the connection string with **your** SQL Server instance name:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_PC_NAME\\SQLEXPRESS;Database=BlindMatchDB;Trusted_Connection=True;TrustServerCertificate=True"
}
```

Replace `YOUR_PC_NAME` with your computer name (e.g. `DESKTOP-ABC123`).

### 3. Run the backend

Open `BlindMatchAPI.slnx` in Visual Studio → press **F5**  
Or from terminal:

```bash
cd BlindMatchAPI
dotnet run
```

Backend runs at: `http://localhost:5010`  
Swagger UI: `http://localhost:5010/swagger`

> The database and test users are created automatically on first run.

### 4. Run the frontend

```bash
cd blind-match-system-main
npm install
npm run dev
```

Frontend runs at: `http://localhost:8080`

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Student | `alice.j@uni.ac.uk` | `Student123!` |
| Student | `bob.s@uni.ac.uk` | `Student123!` |
| Supervisor | `s.williams@uni.ac.uk` | `Super123!` |
| Supervisor | `j.brown@uni.ac.uk` | `Super123!` |
| Module Leader | `r.moore@uni.ac.uk` | `Leader123!` |

---

## Key Features

- **Blind review** — supervisors never see student identities during review
- **Research area matching** — students and supervisors select interests; system finds best matches
- **Role-based dashboards** — separate views for students, supervisors, and module leaders
- **Admin panel** — manage users and research areas
- **JWT authentication** — secure login with role-based access control

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login, returns JWT token |
| GET | `/api/student/proposals` | Get student's proposals |
| POST | `/api/student/proposals` | Submit a new proposal |
| GET | `/api/supervisor/projects` | Get supervisor's assigned projects |
| POST | `/api/supervisor/review` | Submit blind review |
| GET | `/api/admin/users` | List all users |
| POST | `/api/admin/match` | Run the matching algorithm |

Full API docs available at `/swagger` when backend is running.