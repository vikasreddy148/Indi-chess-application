# Quick Start Guide

## Prerequisites

- **Java 17**, **Maven**, **Node.js 18+**
- **Docker Desktop** (for DBs/Redis or full stack) **OR** local **MySQL 8.0+**

---

## Option A: Run Everything with Docker

### 1. Start all services (gateway, user-service, match-service, DBs, Redis, frontend)

```bash
cd Indi-chess-application
docker-compose up -d
```

Wait ~30 seconds for services to start. Frontend: **http://localhost:3000**. API: **http://localhost:8080**.

### 2. Optional: Run only databases + Redis (then run backend/frontend locally)

```bash
docker-compose up -d user-db match-db redis
```

Then start **User Service** (8081), **Match Service** (8082), **API Gateway** (8080), and **Frontend** (see Option B).

---

## Option B: Run Locally (no Docker for apps)

### 1. Start databases

**With Docker:**

```bash
docker-compose up -d user-db match-db redis
```

**With local MySQL:** create DBs and set URLs in each service’s `application.yml`:

```sql
CREATE DATABASE user_service_db;
CREATE DATABASE match_service_db;
```

### 2. Start backend services (in separate terminals)

Use same DB URLs in `application.yml` (Docker: `localhost:3307` / `3308` if mapped; local MySQL: `3306`).

```bash
# Terminal 1 – User Service (8081)
cd backend/user-service && mvn spring-boot:run

# Terminal 2 – Match Service (8082)
cd backend/match-service && mvn spring-boot:run

# Terminal 3 – API Gateway (8080)
cd backend/api-gateway && mvn spring-boot:run
```

### 3. Start frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. Set `VITE_API_BASE=http://localhost:8080` in `.env` so the app talks to the API Gateway (WebSocket uses the same origin).

---

## Testing Until We’re Fully Implemented

Use the **API Gateway** at **http://localhost:8080** for all HTTP tests. Replace `YOUR_TOKEN` with the `token` from login/register.

### 1. Auth (User Service via Gateway)

**Register:**

```bash
curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"player1","email":"p1@test.com","password":"pass123","country":"India"}'
```

**Login:**

```bash
curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail":"player1","password":"pass123"}'
```

Save the `token` from the response and use it as `YOUR_TOKEN` below.

**Profile (protected):**

```bash
curl -s http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Match & moves (Match Service via Gateway)

**Create a match** (player1 vs player2; use a second user id for player2 or same for testing):

```bash
curl -s -X POST http://localhost:8080/api/matches/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-User-Id: 1" \
  -d '{"player2Id":2,"gameType":"CLASSICAL"}'
```

Note the `id` from the response (e.g. `1`).

**Get match:**

```bash
curl -s http://localhost:8080/api/matches/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Make a move:**

```bash
curl -s -X POST http://localhost:8080/api/matches/1/move \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-User-Id: 1" \
  -d '{"matchId":1,"moveUci":"e2e4","fromSquare":"e2","toSquare":"e4"}'
```

**Move history:**

```bash
curl -s http://localhost:8080/api/matches/1/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Resign:**

```bash
curl -s -X POST http://localhost:8080/api/matches/1/resign \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-User-Id: 1"
```

### 3. Matchmaking (Match Service via Gateway)

**Join queue** (use same JWT and set `X-User-Id` to your user id):

```bash
curl -s -X POST "http://localhost:8080/api/matchmaking/join?gameType=CLASSICAL" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-User-Id: 1"
```

**Leave queue:**

```bash
curl -s -X POST http://localhost:8080/api/matchmaking/leave \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-User-Id: 1"
```

### 4. Frontend

1. Open **http://localhost:5173** (or **http://localhost:3000** if using Docker frontend).
2. Use **Get Started** and sign up / log in (auth goes through gateway).
3. After login:
   - **Home**: Find match (matchmaking uses WebSocket so you’re redirected as soon as a match is found), edit profile (country, profile picture URL), see **Your games**, and **Log out**.
   - **Game**: Uses WebSocket when connected (shows “Live”); if it drops, moves/resign/draw fall back to REST. **Offer draw** creates a pending offer; opponent can **Accept** or **Decline**. **Log out** in header.
   - **Auth**: On 401 the app tries to refresh the token (if it expired within 5 minutes); if refresh fails you’re logged out.

### 5. Health checks

- Gateway: `curl -s http://localhost:8080/actuator/health`
- User Service: `curl -s http://localhost:8081/actuator/health`
- Match Service: `curl -s http://localhost:8082/actuator/health`

---

## Ports Summary

| Service      | Port |
|-------------|------|
| API Gateway | 8080 |
| User Service| 8081 |
| Match Service | 8082 |
| Frontend (Vite) | 5173 |
| Frontend (Docker) | 3000 |
| User DB (Docker) | 3307→3306 |
| Match DB (Docker) | 3308→3306 |
| Redis | 6379 |

---

## Troubleshooting

- **Connection refused:** Ensure Docker containers are up (`docker ps`) or local MySQL/Redis are running.
- **Port in use:** Stop the process using 8080, 8081, 8082, or 5173.
- **401 on protected routes:** Use a valid `Authorization: Bearer <token>` and ensure gateway JWT secret matches user-service.
- **Match/move errors:** Ensure `X-User-Id` matches a real user and the match is ONGOING for moves.

