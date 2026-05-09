# Team Task Manager

A full-stack team task management application with role-based access control (RBAC), JWT authentication, and a Kanban-style task board.

## Live Demo

- **Frontend**: *(add Railway URL after deployment)*
- **Backend API**: *(add Railway URL after deployment)*

---

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Backend    | Java 17+, Spring Boot 3.2, Spring Security, JWT |
| Frontend   | React 18, Vite, Tailwind CSS, Axios             |
| Database   | MySQL 8                                         |
| Deployment | Railway                                         |

---

## Prerequisites

| Tool    | Version | Download                                      |
|---------|---------|-----------------------------------------------|
| Java    | 17+     | https://adoptium.net/                         |
| Maven   | 3.8+    | https://maven.apache.org/download.cgi         |
| Node.js | 18+     | https://nodejs.org/                           |
| MySQL   | 8+      | https://dev.mysql.com/downloads/installer/    |

### Verify installations:
```bash
java -version
mvn -version
node -v
npm -v
mysql --version
```

---

## Local Setup Instructions

### 1. Database Setup

#### Windows:
1. Download MySQL Installer from https://dev.mysql.com/downloads/installer/
2. Run installer → choose "MySQL Server" with default settings
3. Set root password during setup (or leave empty for local dev)
4. MySQL starts automatically as a Windows service
5. Verify: Open Command Prompt and run `mysql -u root -p`

#### macOS:
```bash
brew install mysql
brew services start mysql
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

**No manual database creation needed** — the app auto-creates `taskmanagerdb` on first run.

#### Default Database Config:
- Host: `localhost:3306`
- Username: `root`
- Password: *(empty)*
- Database: `taskmanagerdb` (auto-created)

If your MySQL root has a password, set the environment variable:
```bash
export SPRING_DATASOURCE_PASSWORD=YOUR_PASSWORD
```

---

### 2. Backend Setup

#### Windows:
```cmd
cd team-task-manager\backend
mvn clean spring-boot:run
```

#### macOS/Linux:
```bash
cd team-task-manager/backend
mvn clean spring-boot:run
```

Backend starts on **http://localhost:8081**

You should see: `Started TaskManagerApplication in X seconds`

---

### 3. Frontend Setup

#### Windows:
```cmd
cd team-task-manager\frontend
npm install
npm run dev
```

#### macOS/Linux:
```bash
cd team-task-manager/frontend
npm install
npm run dev
```

Frontend starts on **http://localhost:3000** (or next available port — check terminal output)

---

## First-Time Usage

### Step 1: Register an Admin user

Admin users can only be created via API (not through the UI registration page).

**macOS/Linux:**
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"password123","role":"ROLE_ADMIN"}'
```

**Windows (PowerShell):**
```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:8081/api/auth/register" -ContentType "application/json" -Body '{"name":"Admin","email":"admin@test.com","password":"password123","role":"ROLE_ADMIN"}'
```

**Windows (Command Prompt):**
```cmd
curl -X POST http://localhost:8081/api/auth/register -H "Content-Type: application/json" -d "{\"name\":\"Admin\",\"email\":\"admin@test.com\",\"password\":\"password123\",\"role\":\"ROLE_ADMIN\"}"
```

### Step 2: Register Member users

Use the frontend Register page at http://localhost:3000/register (always creates ROLE_MEMBER)

Or via API:
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"password123","role":"ROLE_MEMBER"}'
```

### Step 3: Login

Open http://localhost:3000 and login with the credentials you registered.

---

## Test Credentials

| Role   | Email           | Password    | How to Create                |
|--------|-----------------|-------------|------------------------------|
| Admin  | admin@test.com  | password123 | API only (curl/Postman)      |
| Member | john@test.com   | password123 | API or frontend /register    |

> Note: With MySQL, data persists across backend restarts. You only register once.

---

## Application Workflow

### As Admin:
1. Login → Dashboard shows all projects
2. Create a project (enter name, description, member IDs comma-separated)
3. Click a project → see Kanban board (TODO / IN_PROGRESS / DONE)
4. Create tasks (enter title, description, assignee IDs comma-separated)
5. Assigned users are automatically added as project members
6. Delete tasks or projects using the red Delete button

### As Member:
1. Register via /register page
2. Login → Dashboard shows only projects you're a member of
3. Click a project → see tasks in Kanban columns
4. Change task status using the dropdown (TODO → IN_PROGRESS → DONE)
5. Cannot create/delete projects or tasks

---

## Roles & Permissions

| Action                  | Admin | Member |
|-------------------------|-------|--------|
| Register users          | ✅    | ✅ (self only, as MEMBER) |
| Login                   | ✅    | ✅     |
| View assigned projects  | ✅ (all) | ✅ (own only) |
| Create projects         | ✅    | ❌     |
| Delete projects         | ✅    | ❌     |
| Create tasks            | ✅    | ❌     |
| Delete tasks            | ✅    | ❌     |
| Change task status      | ✅    | ✅     |

---

## API Reference

All endpoints except `/api/auth/**` require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Authentication

| Method | Endpoint             | Body                                                    | Response          |
|--------|----------------------|---------------------------------------------------------|-------------------|
| POST   | /api/auth/register   | `{"name","email","password","role"}`                    | Success message   |
| POST   | /api/auth/login      | `{"email","password"}`                                  | `{token,id,name,email,role}` |

### Projects

| Method | Endpoint              | Body                                          | Auth   | Description         |
|--------|-----------------------|-----------------------------------------------|--------|---------------------|
| GET    | /api/projects         | —                                             | JWT    | List user's projects |
| POST   | /api/projects         | `{"name","description","memberIds":[1,2,3]}`  | Admin  | Create project      |
| DELETE | /api/projects/{id}    | —                                             | Admin  | Delete project + tasks |

### Tasks

| Method | Endpoint                       | Body                                              | Auth   | Description       |
|--------|--------------------------------|---------------------------------------------------|--------|-------------------|
| GET    | /api/projects/{id}/tasks       | —                                                 | JWT    | List project tasks |
| POST   | /api/projects/{id}/tasks       | `{"title","description","assigneeIds":[1,2]}`     | Admin  | Create task       |
| PATCH  | /api/tasks/{id}/status         | `{"status":"IN_PROGRESS"}`                        | JWT    | Update status     |
| DELETE | /api/tasks/{id}                | —                                                 | Admin  | Delete task       |

### Task Status Values:
- `TODO`
- `IN_PROGRESS`
- `DONE`

### Role Values:
- `ROLE_ADMIN`
- `ROLE_MEMBER`

---

## Database Schema

### users
| Column   | Type         | Notes              |
|----------|--------------|--------------------|
| id       | BIGINT (PK)  | Auto-increment     |
| name     | VARCHAR      |                    |
| email    | VARCHAR      | Unique, not null   |
| password | VARCHAR      | BCrypt hashed      |
| role     | ENUM         | ROLE_ADMIN / ROLE_MEMBER |

### projects
| Column      | Type         | Notes              |
|-------------|--------------|--------------------|
| id          | BIGINT (PK)  | Auto-increment     |
| name        | VARCHAR      |                    |
| description | VARCHAR      |                    |
| created_by  | BIGINT (FK)  | → users.id         |

### project_members (join table)
| Column     | Type         | Notes              |
|------------|--------------|--------------------|
| project_id | BIGINT (FK)  | → projects.id      |
| user_id    | BIGINT (FK)  | → users.id         |

### tasks
| Column      | Type         | Notes              |
|-------------|--------------|--------------------|
| id          | BIGINT (PK)  | Auto-increment     |
| title       | VARCHAR      |                    |
| description | VARCHAR      |                    |
| status      | ENUM         | TODO / IN_PROGRESS / DONE |
| project_id  | BIGINT (FK)  | → projects.id      |

### task_assignees (join table)
| Column  | Type         | Notes              |
|---------|--------------|--------------------|
| task_id | BIGINT (FK)  | → tasks.id         |
| user_id | BIGINT (FK)  | → users.id         |

---

## Project Structure

```
team-task-manager/
├── README.md
├── .gitignore
├── backend/                          # Spring Boot Application
│   ├── Dockerfile                    # For Railway deployment
│   ├── pom.xml                       # Maven dependencies
│   └── src/main/
│       ├── java/com/app/taskmanager/
│       │   ├── TaskManagerApplication.java   # Entry point
│       │   ├── controller/
│       │   │   ├── AuthController.java       # /api/auth/** endpoints
│       │   │   ├── ProjectController.java    # /api/projects/** endpoints
│       │   │   └── TaskController.java       # /api/tasks/** endpoints
│       │   ├── dto/
│       │   │   └── DTOs.java                 # Request/Response records
│       │   ├── model/
│       │   │   ├── User.java                 # User entity
│       │   │   ├── Project.java              # Project entity
│       │   │   ├── Task.java                 # Task entity (many-to-many assignees)
│       │   │   ├── Role.java                 # ROLE_ADMIN, ROLE_MEMBER enum
│       │   │   └── TaskStatus.java           # TODO, IN_PROGRESS, DONE enum
│       │   ├── repository/
│       │   │   ├── UserRepository.java
│       │   │   ├── ProjectRepository.java
│       │   │   └── TaskRepository.java
│       │   └── security/
│       │       ├── SecurityConfig.java       # CORS, auth rules, filters
│       │       ├── JwtUtils.java             # Token generation/validation
│       │       ├── JwtAuthFilter.java        # Intercepts requests for JWT
│       │       ├── CustomUserDetails.java    # UserDetails implementation
│       │       └── CustomUserDetailsService.java
│       └── resources/
│           └── application.properties        # DB, server, JWT config (env vars)
│
└── frontend/                         # React (Vite) Application
    ├── Dockerfile                    # For Railway deployment
    ├── nginx.conf                    # Production static file serving
    ├── package.json
    ├── vite.config.js                # Dev server config (port 3000 + proxy)
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx                  # React entry point
        ├── App.jsx                   # Router + protected routes
        ├── index.css                 # Tailwind imports
        ├── context/
        │   └── AuthContext.jsx       # Auth state (login/logout/token)
        ├── services/
        │   └── api.js                # Axios instance with JWT interceptor
        └── pages/
            ├── Login.jsx             # Login form
            ├── Register.jsx          # Registration form (ROLE_MEMBER only)
            ├── Dashboard.jsx         # Project list + create/delete
            └── ProjectDetail.jsx     # Kanban board + task CRUD
```

---

## Deployment (Railway)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Team Task Manager"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/team-task-manager.git
git push -u origin main
```

### Step 2: Create Railway Project
1. Go to https://railway.app → Sign in with GitHub
2. Click **New Project**

### Step 3: Add MySQL Database
1. **+ New** → **Database** → **MySQL**
2. Note the connection variables from the MySQL service

### Step 4: Deploy Backend
1. **+ New** → **GitHub Repo** → Select your repo
2. Settings → **Root Directory**: `backend`
3. Settings → **Builder**: Dockerfile
4. Add Variables:
   ```
   SPRING_DATASOURCE_URL=jdbc:mysql://<MYSQL_HOST>:<MYSQL_PORT>/railway
   SPRING_DATASOURCE_USERNAME=root
   SPRING_DATASOURCE_PASSWORD=<from MySQL service>
   JWT_SECRET=aVeryLongRandomSecretKeyAtLeast32Characters123456
   JWT_EXPIRATION=86400000
   PORT=8081
   ```
5. Settings → Networking → **Generate Domain**

### Step 5: Deploy Frontend
1. **+ New** → **GitHub Repo** → Select same repo
2. Settings → **Root Directory**: `frontend`
3. Settings → **Builder**: Dockerfile
4. Add Variables:
   ```
   VITE_API_URL=https://<your-backend>.up.railway.app/api
   ```
5. Settings → Networking → **Generate Domain**

### Step 6: Register Admin on live app
```bash
curl -X POST https://<your-backend>.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"password123","role":"ROLE_ADMIN"}'
```

---

## Environment Variables

### Backend
| Variable                  | Default                          | Description           |
|---------------------------|----------------------------------|-----------------------|
| PORT                      | 8081                             | Server port           |
| SPRING_DATASOURCE_URL     | jdbc:mysql://localhost:3306/taskmanagerdb | MySQL URL    |
| SPRING_DATASOURCE_USERNAME| root                             | DB username           |
| SPRING_DATASOURCE_PASSWORD| *(empty)*                        | DB password           |
| JWT_SECRET                | mySecretKey...                   | JWT signing key       |
| JWT_EXPIRATION            | 86400000                         | Token TTL (24h in ms) |

### Frontend
| Variable      | Default                        | Description        |
|---------------|--------------------------------|--------------------|
| VITE_API_URL  | http://localhost:8081/api       | Backend API URL    |

---

## Security Details

- Passwords hashed with **BCrypt**
- JWT tokens expire after **24 hours**
- CORS allows: `localhost:*`, `*.railway.app`, `*.up.railway.app`
- All endpoints except `/api/auth/**` require valid JWT
- Admin-only endpoints use `@PreAuthorize("hasRole('ADMIN')")`
- Frontend stores JWT in `localStorage`

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Connection refused" on backend start | MySQL not running. Start it: `brew services start mysql` (mac) or `net start mysql` (win) |
| "Access denied for user 'root'" | Set `SPRING_DATASOURCE_PASSWORD` env var to your MySQL password |
| "Port 8081 already in use" | Kill process: `lsof -i :8081 -t \| xargs kill -9` (mac) or `netstat -ano \| findstr :8081` then `taskkill /PID <PID> /F` (win) |
| Frontend "Login failed" | Check backend is running. Check browser console for CORS errors. |
| Tasks not showing for member | Member must be a project member. Assigning a task auto-adds them. |
| Compile error after code change | Always use `mvn clean spring-boot:run` (clean removes stale classes) |

---

## Authors

- Ayush Rana
- Manvi
