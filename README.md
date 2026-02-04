# IndiChess – Microservices Chess Application

A full-stack, real-time multiplayer chess platform built with a microservices architecture. Users can register, log in (including Google OAuth), find opponents via matchmaking, play games with live moves over WebSocket, and track ratings by game type.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [API Overview](#api-overview)
- [Frontend](#frontend)
- [Testing](#testing)
- [Building for Production](#building-for-production)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Ports Summary](#ports-summary)
- [Troubleshooting](#troubleshooting)
- [License & Author](#license--author)

---

## Features

- **Authentication & users**
  - Register, login, logout, token refresh
  - Google OAuth 2.0 (Login with Google)
  - JWT-based auth; protected profile and change-password
- **Matchmaking**
  - Join/leave queue by game type (Classical, Rapid, Blitz, Bullet)
  - Automatic pairing; optional WebSocket notifications when a match is found
- **Gameplay**
  - Create match, make moves (UCI), move history
  - Resign, offer/accept/decline draw
  - Real-time updates via WebSocket (STOMP); REST fallback for moves/resign/draw
- **Ratings**
  - Per-game-type ratings (ELO-style) with dedicated endpoints
- **Infrastructure**
  - API Gateway (routing, JWT validation, CORS)
  - Separate MySQL DBs per service; Redis for match-service (e.g. queue/session)
  - Docker Compose for local full stack; Kubernetes manifests for deployment

---

## Architecture

The application uses a microservices layout with a single entry point (API Gateway).

| Service         | Port | Responsibility |
|----------------|------|----------------|
| **API Gateway** | 8080 | Request routing, JWT validation, CORS, proxy to user/match services |
| **User Service** | 8081 | Auth (JWT, OAuth2), user management, profile, sessions |
| **Match Service** | 8082 | Matches, moves, matchmaking, ratings, WebSocket game updates |
| **Config Service** | 8888 | Optional centralized config (Spring Cloud Config) |
| **Frontend**   | 3000 (Docker) / 5173 (Vite) | React SPA; talks to API Gateway |

- **Databases:** User Service → MySQL (`user_service_db`); Match Service → MySQL (`match_service_db`).
- **Redis:** Used by Match Service (e.g. matchmaking queue / session state).
- All HTTP and WebSocket traffic from the frontend goes through the API Gateway; the gateway forwards to User Service or Match Service by path.

---

## Technology Stack

### Backend

- **Java 17**, Maven
- **Spring Boot 3.3.2**, Spring Cloud 2023.0.3
- **User Service:** Spring Web, Data JPA, Security, Validation, OAuth2 Client, Actuator; JWT (jjwt); Flyway
- **Match Service:** Spring Web, Data JPA, WebSocket (STOMP), Validation, OpenFeign, Data Redis; Flyway
- **API Gateway:** Spring Cloud Gateway, Actuator, JWT validation
- **Config Service:** Spring Cloud Config Server (optional)
- **Data:** MySQL 8.0, Redis 7

### Frontend

- **React 19**, Vite 6, React Router 7
- **Tailwind CSS 4**, Framer Motion
- **chess.js** (game logic), **SockJS + StompJS** (WebSocket)

### Infrastructure

- Docker & Docker Compose
- Kubernetes (manifests in `k8s/`)

---

## Project Structure

```
Indi-chess-application/
├── backend/                    # Backend microservices (Maven multi-module)
│   ├── api-gateway/            # Spring Cloud Gateway, JWT filter, routing
│   ├── config-service/        # Optional Spring Cloud Config server
│   ├── match-service/         # Matches, moves, matchmaking, ratings, WebSocket
│   └── user-service/         # Auth, users, profile, OAuth2
├── frontend/                  # React + Vite SPA
│   ├── src/
│   │   ├── api/               # API clients (auth, users, match, ratings)
│   │   ├── components/        # ChessBoard, modals, UI components
│   │   ├── context/           # AuthContext
│   │   ├── pages/             # Landing, Login/Register, Home, Game, Local Game
│   │   └── ws/                # STOMP WebSocket client
│   ├── Dockerfile
│   └── nginx.conf
├── k8s/                       # Kubernetes manifests
│   ├── backend/               # api-gateway, match-service, user-service
│   ├── frontend/
│   └── infrastructure/        # MySQL, Redis
├── docker-compose.yml
├── pom.xml                    # Root POM (backend parent)
└── README.md
```

---

## Prerequisites

- **Java 17**, **Maven 3.8+**
- **Node.js 18+** (e.g. 20) for frontend
- **Docker & Docker Compose** (for full stack or DBs/Redis only)
- **MySQL 8.0+** and **Redis** if running backend locally without Docker

---

## Quick Start

### Option A: Run everything with Docker

```bash
git clone <repository-url>
cd Indi-chess-application
docker-compose up -d
```

Wait ~30 seconds for services to start.

- **Frontend:** http://localhost:3000  
- **API Gateway:** http://localhost:8080  

### Option B: Run only databases and Redis (backend/frontend on host)

```bash
docker-compose up -d user-db match-db redis
```

Then start **User Service** (8081), **Match Service** (8082), **API Gateway** (8080), and **Frontend** (see below).

### Run backend locally (separate terminals)

```bash
# Terminal 1 – User Service
cd backend/user-service && mvn spring-boot:run

# Terminal 2 – Match Service
cd backend/match-service && mvn spring-boot:run

# Terminal 3 – API Gateway
cd backend/api-gateway && mvn spring-boot:run
```

Use the same DB URLs as in each service’s config (Docker: `localhost:3307` / `3308` for user/match DBs if port-mapped; Redis: `localhost:6379`).

### Run frontend locally

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. Set `VITE_API_BASE=http://localhost:8080` in `.env` so the app uses the API Gateway (WebSocket will use the same origin when proxied or same host).

---

## Configuration

### Environment variables (backend)

| Variable | Service | Description |
|----------|---------|-------------|
| `SPRING_DATASOURCE_URL` | user-service, match-service | JDBC URL for MySQL |
| `SPRING_DATASOURCE_USERNAME` / `SPRING_DATASOURCE_PASSWORD` | user-service, match-service | DB credentials |
| `JWT_SECRET` | user-service, match-service, api-gateway | Must be the same across all three |
| `JWT_TTL_SECONDS` | user-service | JWT expiration (e.g. 18000) |
| `USER_SERVICE_URL` | api-gateway, match-service | e.g. `http://user-service:8081` |
| `MATCH_SERVICE_URL` | api-gateway | e.g. `http://match-service:8082` |
| `REDIS_HOST` / `REDIS_PORT` | match-service | Redis connection |
| `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET` | user-service | For Google OAuth (redirect URI: `http://localhost:8080/login/oauth2/code/google` for local) |
| `FRONTEND_URL` / `FRONTEND_URL_DEV` | api-gateway | Allowed frontend origins if needed |

### Gateway routes

- `/api/auth/**`, `/api/users/**`, `/oauth2/**`, `/login/oauth2/**` → User Service  
- `/api/matches/**`, `/api/matchmaking/**`, `/api/ratings/**`, `/ws-indichess/**` → Match Service  

Protected routes require header: `Authorization: Bearer <JWT>`. Match Service endpoints that need the current user also expect `X-User-Id: <userId>` (gateway or client can set it from JWT).

---

## API Overview

Use the **API Gateway** base URL (e.g. `http://localhost:8080`) for all HTTP calls. Replace `YOUR_TOKEN` with the JWT from login/register.

### Auth (User Service)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register (username, email, password, country) |
| POST | `/api/auth/login` | Login (usernameOrEmail, password) |
| POST | `/api/auth/logout` | Logout (Bearer token) |
| POST | `/api/auth/refresh` | Refresh JWT |
| POST | `/api/auth/change-password` | Change password (authenticated) |

### Users (User Service)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users/profile` | Current user profile (Bearer) |
| PUT | `/api/users/profile` | Update profile (Bearer) |
| GET | `/api/users/{id}` | Get user by ID |

### Matches & gameplay (Match Service)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/matches/create` | Create match (player2Id, gameType); requires `X-User-Id` |
| GET | `/api/matches/{id}` | Get match |
| GET | `/api/matches/user/{userId}` | List matches for user |
| POST | `/api/matches/{id}/move` | Make move (moveUci, etc.); `X-User-Id` |
| GET | `/api/matches/{id}/history` | Move history |
| POST | `/api/matches/{id}/resign` | Resign; `X-User-Id` |
| POST | `/api/matches/{id}/draw` | Offer draw; `X-User-Id` |
| POST | `/api/matches/{id}/draw/accept` | Accept draw; `X-User-Id` |
| POST | `/api/matches/{id}/draw/decline` | Decline draw; `X-User-Id` |

### Matchmaking (Match Service)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/matchmaking/join?gameType=CLASSICAL\|RAPID\|BLITZ\|BULLET` | Join queue; `X-User-Id` |
| POST | `/api/matchmaking/leave` | Leave queue; `X-User-Id` |

### Ratings (Match Service)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/ratings/me` | Current user’s ratings by game type; `X-User-Id` |
| GET | `/api/ratings/user/{userId}` | Ratings for a user |

### Health

- Gateway: `GET http://localhost:8080/actuator/health`
- User Service: `GET http://localhost:8081/actuator/health`
- Match Service: `GET http://localhost:8082/actuator/health`

---

## Frontend

- **Landing:** Get Started, Login, Register, Google OAuth.
- **Home (after login):** Find match (matchmaking), edit profile (country, profile picture URL), list your games, log out.
- **Game:** Chess board, move input, resign, offer/accept/decline draw. Uses WebSocket when connected (shows “Live”); falls back to REST for moves/resign/draw if WebSocket is down. Token refresh on 401 (if within a short window) or logout.
- **Local game:** Play locally (no backend).

---

## Testing

```bash
# Backend (all services)
cd backend
mvn test

# Frontend
cd frontend
npm test
```

---

## Building for Production

```bash
# Backend JARs
cd backend
mvn clean package -DskipTests

# Frontend static build
cd frontend
npm run build
```

Docker images are built from each service’s `Dockerfile` (see `docker-compose.yml` and `k8s/`).

---

## Kubernetes Deployment

- Manifests are in **`k8s/`**: namespace, backend (api-gateway, user-service, match-service), frontend, infrastructure (MySQL, Redis).
- See **`k8s/README.md`** for build, push, and deploy steps (e.g. apply namespace, secrets/configmaps, infrastructure, then backend and frontend).
- Use the same `JWT_SECRET` across user-service, match-service, and api-gateway; configure DB and Redis via secrets.

---

## Ports Summary

| Service        | Port |
|----------------|------|
| API Gateway    | 8080 |
| User Service   | 8081 |
| Match Service  | 8082 |
| Frontend (Vite)| 5173 |
| Frontend (Docker) | 3000 |
| User DB (Docker) | 3307 → 3306 |
| Match DB (Docker) | 3308 → 3306 |
| Redis          | 6379 |
| Config Service (optional) | 8888 |

---

## Troubleshooting

- **Connection refused:** Ensure Docker containers are up (`docker ps`) or local MySQL/Redis are running and URLs/ports match config.
- **Port in use:** Stop the process using 8080, 8081, 8082, or 5173.
- **401 on protected routes:** Use a valid `Authorization: Bearer <token>` and ensure `JWT_SECRET` is identical in user-service, match-service, and api-gateway.
- **Match/move errors:** Ensure `X-User-Id` matches a real user and the match is in `ONGOING` status for moves.
- **Google OAuth:** Add redirect URI `http://localhost:8080/login/oauth2/code/google` (or your gateway URL) in Google Cloud Console and set `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` for user-service.

---

## License & Author

- **License:** MIT  
- **Author:** Vikas Reddy  

For a short, copy-paste-friendly runbook (curl examples, ports, troubleshooting), see **QUICK_START.md**.
