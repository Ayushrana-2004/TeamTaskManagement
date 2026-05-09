# Team Task Manager

A full-stack team task management application with role-based access control (RBAC), JWT authentication, and a Kanban-style task board.

---

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Backend    | Java 17+, Spring Boot 3.2, Spring Security, JWT |
| Frontend   | React 18, Vite, Tailwind CSS, Axios             |
| Database   | MySQL 8                                         |
| Auth       | JWT (JSON Web Tokens) with BCrypt passwords     |

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

## Setup Instructions

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
sudo mysql_secure_installation
```

**No manual database creation needed** — the app auto-creates `taskmanagerdb` on first run.

#### Database Configuration (in `backend/src/main/resources/application.properties`):
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/taskmanagerdb?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=
```

If your MySQL root has a password, change `spring.datasource.password=YOUR_PASSWORD`

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

Frontend starts on **http://localhost:5173** (check terminal for exact port)

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

Option A: Use the frontend Register page at http://localhost:5173/register (always creates ROLE_MEMBER)

Option B: Via API:

**macOS/Linux:**
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"password123","role":"ROLE_MEMBER"}'
```

**Windows (PowerShell):**
```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:8081/api/auth/register" -ContentType "application/json" -Body '{"name":"John","email":"john@test.com","password":"password123","role":"ROLE_MEMBER"}'
```

### Step 3: Login on the frontend

Open http://localhost:5173 and login with the credentials you registered.

---

## Test Credentials

| Role   | Email           | Password    | How to Create                |
|--------|-----------------|-------------|------------------------------|
| Admin  | admin@test.com  | password123 | API only (curl/Postman)      |
| Member | john@test.com   | password123 | API or frontend /register    |

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
3. Click a project → see tasks assigned to you and others
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
├── backend/                          # Spring Boot Application
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
│       │   │   ├── Task.java                 # Task entity
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
│           └── application.properties        # DB, server, JWT config
│
└── frontend/                         # React (Vite) Application
    ├── package.json
    ├── vite.config.js                # Dev server + proxy config
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
            ├── Register.jsx          # Registration form (ROLE_MEMBER)
            ├── Dashboard.jsx         # Project list + create form
            └── ProjectDetail.jsx     # Kanban board + task CRUD
```

---

## Configuration Files

### backend/src/main/resources/application.properties
```properties
server.port=8081
spring.datasource.url=jdbc:mysql://localhost:3306/taskmanagerdb?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
jwt.secret=mySecretKeyForJwtTokenGeneration12345678901234567890
jwt.expiration=86400000
```

### frontend/src/services/api.js
```javascript
baseURL: 'http://localhost:8081/api'
```
Change this if your backend runs on a different port.

### frontend/vite.config.js
```javascript
server: { port: 3000 }  // May use 5173 if 3000 is taken
```

---

## Security Details

- Passwords are hashed with **BCrypt** before storage
- JWT tokens expire after **24 hours** (86400000 ms)
- JWT secret key is in `application.properties` (change for production)
- CORS allows origins: `localhost:3000`, `localhost:3006`, `localhost:5173`
- All endpoints except `/api/auth/**` require valid JWT
- Admin-only endpoints use `@PreAuthorize("hasRole('ADMIN')")`
- Frontend stores JWT in `localStorage`

---

## Troubleshooting

### "Connection refused" on backend start
- MySQL is not running. Start it:
  - Windows: `net start mysql` or check Services app
  - macOS: `brew services start mysql`
  - Linux: `sudo systemctl start mysql`

### "Access denied for user 'root'"
- Your MySQL root has a password. Update `application.properties`:
  ```
  spring.datasource.password=YOUR_PASSWORD
  ```

### "Port 8081 already in use"
- Kill the existing process:
  - macOS/Linux: `lsof -i :8081 -t | xargs kill -9`
  - Windows: `netstat -ano | findstr :8081` then `taskkill /PID <PID> /F`

### Frontend shows "Login failed" after registering
- Make sure the backend is running
- Check browser console (F12) for CORS errors
- If frontend port changed, add it to `SecurityConfig.java` allowed origins

### Tasks not showing for a member
- The member must be a project member (added via `memberIds` when creating the project)
- When admin creates a task with `assigneeIds`, those users are auto-added to the project

### Data lost after restart
- This only happens with H2 (in-memory). With MySQL, data persists.
- If you switched from H2 to MySQL, old H2 data is gone — re-register users.

### "Cannot find symbol: DeleteMapping" or similar compile errors
- Run `mvn clean spring-boot:run` (the `clean` is important to clear stale classes)

---

## Useful Commands

### Create a project (as admin):
```bash
TOKEN=$(curl -s -X POST http://localhost:8081/api/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@test.com","password":"password123"}' | python3 -c 'import sys,json; print(json.load(sys.stdin)["token"])')

curl -X POST http://localhost:8081/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Sprint 1","description":"First sprint tasks","memberIds":[1,2,3]}'
```

### Create a task:
```bash
curl -X POST http://localhost:8081/api/projects/1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Fix login bug","description":"Login fails on mobile","assigneeIds":[2,3]}'
```

### Check all projects:
```bash
curl -s http://localhost:8081/api/projects -H "Authorization: Bearer $TOKEN"
```

---

## Production Considerations

If deploying to production, change these:
1. `jwt.secret` — use a strong random 256-bit key
2. `spring.datasource.password` — use a real password
3. `spring.jpa.hibernate.ddl-auto` — change from `update` to `validate`
4. CORS origins in `SecurityConfig.java` — replace localhost with your domain
5. `spring.jpa.show-sql` — set to `false`
6. Frontend `api.js` baseURL — point to your production backend URL
