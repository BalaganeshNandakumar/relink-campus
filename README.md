# ReLink

ReLink — Campus Lost & Found

A full-stack campus Lost and Found management platform.

## Prerequisites

- Java 21+
- Maven (or included `./mvnw.cmd`)
- PostgreSQL 16+
- Node.js 18+ (for frontend)

---

## Backend Environment Variables

The backend requires the following environment variables to be set before starting the Spring Boot server:

| Environment Variable | Description | Example / Required Format |
|---|---|---|
| `DB_PASSWORD` | Password for the local PostgreSQL database user (`postgres`). | `your_postgres_password` |
| `JWT_SECRET` | Secret key used to sign and verify HMAC-SHA256 JWT tokens. Must be at least 256 bits (32+ characters). | `your_jwt_secret_key_min_32_chars` |

### Setting Environment Variables (PowerShell)

```powershell
$env:DB_PASSWORD="your_postgres_password"
$env:JWT_SECRET="your_jwt_secret_key_min_32_chars"
```

### Setting Environment Variables (Command Prompt)

```cmd
set DB_PASSWORD=your_postgres_password
set JWT_SECRET=your_jwt_secret_key_min_32_chars
```

### Running the Backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Server runs on: `http://localhost:8081`

---

## Authentication & Security (JWT)

- **Public Endpoints**:
  - `POST /api/auth/register` - Register a new user
  - `POST /api/auth/login` - Login and receive a JWT token
- **Protected Endpoints** (Requires `Authorization: Bearer <token>`):
  - `POST /api/items` - Report an item (reporter identified by JWT)
  - `GET /api/items` - List all items
  - `GET /api/items/{id}` - Get item details
  - `GET /api/items/search` - Search items by filters
  - `PUT /api/items/{id}` - Update item (owner identified by JWT)
  - `DELETE /api/items/{id}` - Delete item (owner identified by JWT)
  - `PUT /api/items/{id}/claim` - Claim an item (claimer identified by JWT)
  - `PUT /api/items/{id}/return` - Mark item returned (claimer identified by JWT)
