# ReLink - Backend

Spring Boot REST API backend configured for local PostgreSQL.

---

## Prerequisites

- **Java JDK 21+** (or Java 25)
- **PostgreSQL** running locally on port `5432` with a database named `lost_found_db`

---

## Environment Variables Configuration

To protect database credentials and avoid hardcoding passwords in source code, the backend reads the PostgreSQL password from the environment variable **`DB_PASSWORD`**.

### 1. Setting `DB_PASSWORD`

#### PowerShell (Windows)
For the current terminal session:
```powershell
$env:DB_PASSWORD="your_local_postgres_password"
```
Or to set permanently for your user account:
```powershell
[System.Environment]::SetEnvironmentVariable('DB_PASSWORD', 'your_local_postgres_password', 'User')
```

#### Windows Command Prompt (CMD)
```cmd
set DB_PASSWORD=your_local_postgres_password
```

#### macOS / Linux (Bash / Zsh)
```bash
export DB_PASSWORD="your_local_postgres_password"
```

#### In IDEs (VS Code / IntelliJ)
- **IntelliJ IDEA**: Run > Edit Configurations > Environment variables > add `DB_PASSWORD=your_password`
- **VS Code** (launch.json): Add `"env": { "DB_PASSWORD": "your_password" }`

---

## Running the Application

With `DB_PASSWORD` set in your terminal:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

The Spring Boot backend will start on **`http://localhost:8081`** and connect to `jdbc:postgresql://localhost:5432/lost_found_db`.

---

## Database Configuration Details

The database is configured in `src/main/resources/application.properties`:

- `spring.datasource.url`: Points to `jdbc:postgresql://localhost:5432/lost_found_db`.
- `spring.datasource.username`: `postgres`.
- `spring.datasource.password`: `${DB_PASSWORD}` dynamically populated from the environment.
- `spring.datasource.driver-class-name`: `org.postgresql.Driver`.
- `spring.jpa.hibernate.ddl-auto`: `update` (Hibernate synchronizes schema changes with entity definitions without dropping existing data).
