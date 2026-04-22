# Task: Project Setup

| | |
|---|---|
| **Epic** | 01 — Foundation |
| **Assignee** | Blaž Perić |
| **Estimate** | 2 days |
| **Status** | Not Started |
| **Depends on** | Nothing — first task |

## Description

Create the project skeleton: a .NET 9 Web API project and a React + TypeScript (Vite) project. Configure CORS, environment variables, and a shared launch workflow. Update the root README with setup instructions.

## Acceptance Criteria

- [ ] `/backend` — .NET 9 Web API project created (`dotnet new webapi`)
- [ ] `/frontend` — React + TypeScript Vite project created (`npm create vite@latest`)
- [ ] Backend runs on `http://localhost:5000`, frontend on `http://localhost:3000`
- [ ] CORS configured in .NET to allow requests from `http://localhost:3000`
- [ ] `.env` / `appsettings.Development.json` contains DB connection string placeholder
- [ ] `.gitignore` covers `bin/`, `obj/`, `node_modules/`, `.env`
- [ ] Root `README.md` documents: prerequisites, how to run backend, how to run frontend
- [ ] Health check endpoint: `GET /api/health` returns `200 OK`

## Technical Notes

**Backend structure to create:**
```
/backend/
  /Controllers/
  /Services/
  /Models/
    /Entities/
    /DTOs/
  /Data/
    AppDbContext.cs
  Program.cs
  appsettings.json
  appsettings.Development.json
```

**Frontend structure to create:**
```
/frontend/src/
  /pages/
  /components/
  /services/   ← typed fetch wrappers
  /hooks/
  App.tsx
  main.tsx
```

**Global API response wrapper — agree on this shape now so all controllers use it:**
```csharp
public record ApiResponse<T>(T? Data, string? Error);
```

**Packages to install (backend):**
```
Microsoft.EntityFrameworkCore.SqlServer
Microsoft.EntityFrameworkCore.Tools
CsvHelper
QuestPDF
```

**Packages to install (frontend):**
```
react-router-dom
axios (or native fetch — team choice)
```
