# IndiChess – Online Chess Application

IndiChess is a full-stack online chess platform built with a **microservices architecture**. Users can register, play real-time online games with matchmaking, play local two-player games, and manage profiles and ratings. The backend is Java/Spring Boot with MySQL and Redis; the frontend is React with Vite.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [API Endpoints](#api-endpoints)
- [WebSocket API](#websocket-api)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Development](#development)
- [Testing](#testing)

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, Vite 6, React Router 7, Tailwind CSS 4, Framer Motion, chess.js, STOMP/SockJS |
| **Backend** | Java 17, Spring Boot 3.3, Spring Cloud Gateway, Spring Security, JWT, Spring WebSocket (STOMP) |
| **Databases** | MySQL 8 (user-service, match-service), Redis 7 (matchmaking queue) |
| **Infrastructure** | Docker, Docker Compose, Kubernetes (optional), Nginx |
| **Build** | Maven (backend), npm (frontend) |

---

## Project Structure

```
Indi-chess-application/
├── pom.xml                          # Root Maven POM (includes backend module)
├── docker-compose.yml               # Full stack: services + DBs + Redis + frontend
├── README.md                        # This file
│
├── backend/                         # Java microservices (Maven multi-module)
│   ├── pom.xml                     # Backend parent POM (Spring Boot 3.3, Java 17)
│   ├── user-service/               # Auth, users, profile, OAuth2
│   │   ├── Dockerfile
│   │   ├── pom.xml
│   │   └── src/main/java/com/indichess/user/
│   │       ├── UserServiceApplication.java
│   │       ├── controller/         # AuthController, UserController
│   │       ├── service/            # AuthService, JwtService, UserService
│   │       ├── config/             # SecurityConfig, OAuth2SuccessHandler
│   │       ├── dto/                # LoginRequest, RegisterRequest, UserResponse, etc.
│   │       ├── model/              # User, Role, UserSession
│   │       ├── repo/               # UserRepository, RoleRepository
│   │       ├── filters/            # JwtAuthenticationFilter
│   │       └── exception/          # GlobalExceptionHandler
│   │   └── src/main/resources/
│   │       ├── bootstrap.yml
│   │       └── db/migration/       # Flyway: users, roles, sessions
│   │
│   ├── match-service/              # Matches, matchmaking, game moves, ratings
│   │   ├── Dockerfile
│   │   ├── pom.xml
│   │   └── src/main/java/com/indichess/match/
│   │       ├── MatchServiceApplication.java
│   │       ├── controller/        # MatchController, MatchmakingController, GameController, RatingController
│   │       ├── service/            # MatchService, GameService, MatchQueueService, RatingService
│   │       ├── websocket/          # GameMessageController (STOMP)
│   │       ├── config/             # WebSocketConfig, TimeControlConfig
│   │       ├── client/             # UserServiceClient (HTTP)
│   │       ├── dto/                # MatchResponse, MoveRequest, RatingResponse
│   │       ├── model/              # Match, Move, Rating, MatchQueue, GameType
│   │       └── repo/               # MatchRepository, MoveRepository, RatingRepository
│   │   └── src/main/resources/
│   │       ├── bootstrap.yml
│   │       └── db/migration/       # matches, moves, ratings, match_queue, clocks
│   │
│   ├── api-gateway/                # Spring Cloud Gateway, JWT validation, routing
│   │   ├── Dockerfile
│   │   ├── pom.xml
│   │   └── src/main/java/com/indichess/gateway/
│   │       ├── ApiGatewayApplication.java
│   │       ├── filter/             # JwtValidationFilter, RequestLoggingFilter
│   │       └── exception/          # GlobalExceptionHandler
│   │   └── src/main/resources/
│   │       ├── bootstrap.yml
│   │       └── application.yml     # Routes to user-service, match-service, CORS
│   │
│   └── config-service/             # Optional central config (Spring Cloud Config)
│       ├── Dockerfile
│       ├── pom.xml
│       └── src/main/java/com/indichess/config/
│           └── ConfigServiceApplication.java
│
├── frontend/                       # React SPA
│   ├── package.json               # indichess-frontend, Vite, React 19, Tailwind
│   ├── Dockerfile                 # Node build → nginx serve
│   ├── nginx.conf                 # SPA + proxy /api, /ws-indichess, OAuth routes
│   ├── index.html
│   ├── vite.config.js             # Dev proxy to API and WebSocket
│   ├── tailwind.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                 # Routes, ProtectedRoute, PublicOnlyRoute
│       ├── index.css
│       ├── api/                    # HTTP client and API modules
│       │   ├── client.js          # apiRequest, getAuthHeaders, X-User-Id
│       │   ├── auth.js            # login, register, logout, changePassword
│       │   ├── users.js           # getProfile, updateProfile, getUserById
│       │   ├── match.js           # matchmaking, getMatch, move, resign, draw
│       │   └── ratings.js         # getMyRatings, getUserRatings
│       ├── config/
│       │   └── api.js             # getApiBase, getOAuthBase, getWsBase
│       ├── context/
│       │   └── AuthContext.jsx    # Auth state, login, logout, token, userId
│       ├── components/
│       │   ├── Badge.jsx
│       │   ├── Button.jsx
│       │   ├── Card.jsx
│       │   ├── ChessBoard.jsx     # Board UI, drag/drop, highlights
│       │   ├── GameOverModal.jsx
│       │   ├── Input.jsx
│       │   ├── Logo.jsx
│       │   └── PromotionModal.jsx
│       ├── lib/
│       │   └── chessConstants.js
│       ├── pages/
│       │   ├── LandingPage.jsx
│       │   ├── LoginRegisterPage.jsx
│       │   ├── OAuthCallbackPage.jsx
│       │   ├── HomePage.jsx       # Matchmaking, profile, game list, ratings
│       │   ├── GamePage.jsx       # Online game, WebSocket, clocks, draw/resign
│       │   └── LocalGamePage.jsx  # Local two-player (no backend)
│       └── ws/
│           └── stompClient.js     # STOMP over SockJS, matchmaking + game topics
│
└── k8s/                           # Kubernetes manifests (optional)
    ├── 01-namespace.yaml
    ├── 02-secrets.yaml
    ├── 03-configmap.yaml
    ├── 04-user-db.yaml
    ├── 05-match-db.yaml
    ├── 06-redis.yaml
    ├── 07-config-service.yaml
    ├── 08-user-service.yaml
    ├── 09-match-service.yaml
    ├── 10-api-gateway.yaml
    ├── 11-frontend.yaml
    └── 12-ingress.yaml             # /api → gateway, / → frontend
```

---

## Features

### Authentication & Users

- **Register** – Username, email, password, optional country.
- **Login** – Username or email + password; returns JWT and user info.
- **Logout** – Invalidates session (token blacklist in user-service).
- **Refresh token** – `POST /api/auth/refresh` with Bearer token.
- **Change password** – Authenticated users can change password.
- **OAuth2 (Google)** – Login/register via Google; redirect to `/oauth/callback` with token.
- **Profile** – Get/update profile (username, email, country); fetch user by ID for opponent info.

### Matchmaking & Game Types

- **Queue by game type** – Join matchmaking for **Rapid (10+0)**, **Blitz (3+2)**, or **Classical (30+0)**.
- **Real-time matching** – WebSocket topic `/topic/matchmaking/{userId}`; when matched, receive match object and redirect to game.
- **Leave queue** – Leave matchmaking before a match is found.

### Online Gameplay

- **Real-time moves** – Moves, resign, and draw actions sent over WebSocket to `/app/game/{matchId}/*`; state broadcast on `/topic/game/{matchId}`.
- **Chess rules** – Move validation (including pawn promotion) on server; board state (FEN) and clocks stored in match-service.
- **Clocks** – Per-game-type time controls; server maintains remaining time (with optional increment).
- **Resign** – Player can resign to end the game.
- **Draw** – Offer draw; opponent can accept or decline via WebSocket/API.

### Ratings

- **Per game type** – Separate ratings for RAPID, BLITZ, CLASSICAL (default 1200).
- **My ratings** – `GET /api/ratings/me` (uses `X-User-Id` from gateway).
- **User ratings** – `GET /api/ratings/user/{userId}` for profile/opponent display.

### Local Game

- **Two-player on one device** – `/local`: no login required; uses `chess.js` only; checkmate, stalemate, draw detection; promotion modal.

### UI/UX

- **Landing** – Hero, feature highlights, login/register links.
- **Home** – Game type selector, “Find match”, profile section, recent games list, ratings display.
- **Game page** – Chess board, move history, clocks, resign/draw buttons, game-over modal.
- **Responsive** – Tailwind-based layout; works on desktop and mobile.

---

## API Endpoints

All HTTP APIs are exposed via the **API Gateway** at port **8080**. The gateway routes to user-service (8081) and match-service (8082) and adds JWT validation (except for auth and OAuth paths).

**Base URL:** `http://localhost:8080` (or your gateway host)  
**Auth:** `Authorization: Bearer <token>`  
**User context:** `X-User-Id: <userId>` (set by gateway from JWT; required for matchmaking, moves, resign, draw, ratings/me)

### Auth (`/api/auth`) – User Service

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | No | Register: `{ username, email, password, country? }` → `AuthResponse` |
| `POST` | `/api/auth/login` | No | Login: `{ usernameOrEmail, password }` → `AuthResponse` |
| `POST` | `/api/auth/logout` | Bearer | Logout (invalidates token) |
| `POST` | `/api/auth/refresh` | Bearer | Refresh JWT → `AuthResponse` |
| `POST` | `/api/auth/change-password` | Bearer | Body: `{ currentPassword, newPassword }` |

### Users (`/api/users`) – User Service

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/users/profile` | Bearer | Current user profile → `UserResponse` |
| `PUT` | `/api/users/profile` | Bearer | Update profile (e.g. username, email, country) |
| `GET` | `/api/users/{id}` | Bearer | Get user by ID → `UserResponse` |

### Matchmaking (`/api/matchmaking`) – Match Service

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/matchmaking/join?gameType=RAPID\|BLITZ\|CLASSICAL` | Bearer + X-User-Id | Join queue; 201 + Match when matched, 200 + `{ status: "waiting" }` otherwise |
| `POST` | `/api/matchmaking/leave` | Bearer + X-User-Id | Leave queue |

### Matches (`/api/matches`) – Match Service

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/matches/create` | Bearer + X-User-Id | Create match: `{ player2Id, gameType }` (optional; matchmaking is primary) |
| `GET` | `/api/matches/{id}` | Bearer | Get match by ID → `MatchResponse` |
| `GET` | `/api/matches/user/{userId}` | Bearer | List matches for user → `MatchResponse[]` |

### Game Actions (`/api/matches`) – Match Service

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/matches/{id}/move` | Bearer + X-User-Id | Make move: `{ moveUci }` → `MatchResponse` |
| `POST` | `/api/matches/{id}/resign` | Bearer + X-User-Id | Resign → `MatchResponse` |
| `POST` | `/api/matches/{id}/draw` | Bearer + X-User-Id | Offer draw → `MatchResponse` |
| `POST` | `/api/matches/{id}/draw/accept` | Bearer + X-User-Id | Accept draw → `MatchResponse` |
| `POST` | `/api/matches/{id}/draw/decline` | Bearer + X-User-Id | Decline draw → `MatchResponse` |
| `GET` | `/api/matches/{id}/history` | Bearer | Move history → `MoveResponse[]` |

### Ratings (`/api/ratings`) – Match Service

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/ratings/me` | Bearer + X-User-Id | Current user’s ratings by game type |
| `GET` | `/api/ratings/user/{userId}` | Bearer | Ratings for user |

---

## WebSocket API

**URL:** Same origin as API (e.g. `http://localhost:8080/ws-indichess` or via frontend proxy).  
**Protocol:** SockJS + STOMP.  
**Auth:** Query param `token=<JWT>` when connecting (handled by frontend).

### Connection

- Connect to `/ws-indichess` with `token` in query string; gateway/match-service validate JWT and set user context.

### Subscriptions (receive)

| Topic | Description |
|-------|-------------|
| `/topic/matchmaking/{userId}` | When matched, receive full match object; redirect to `/game/:gameId`. |
| `/topic/game/{matchId}` | Game updates: `MOVE_MADE`, `RESIGNED`, `DRAW`, `DRAW_OFFERED`, `DRAW_DECLINED`, `ERROR`. |

### Sends (client → server)

| Destination | Body | Description |
|-------------|------|-------------|
| `/app/game/{matchId}/move` | `{ "moveUci": "e2e4" }` | Play move (UCI). |
| `/app/game/{matchId}/resign` | `{}` | Resign. |
| `/app/game/{matchId}/draw` | `{}` | Offer draw. |
| `/app/game/{matchId}/draw/accept` | `{}` | Accept draw. |
| `/app/game/{matchId}/draw/decline` | `{}` | Decline draw. |

---

## Getting Started

### Prerequisites

- **Docker & Docker Compose** (recommended), or
- **Java 17**, **Maven 3.8+**, **Node 20+**, **MySQL 8**, **Redis 7** for local runs.

### Run with Docker Compose

1. Clone the repo and go to the project root:
   ```bash
   cd Indi-chess-application
   ```

2. Start all services (builds images if needed):
   ```bash
   docker compose up -d
   ```

3. Wait for health checks (gateway, user-service, match-service). Then open:
   - **Frontend:** http://localhost:3000  
   - **API Gateway:** http://localhost:8080  

4. Optional: run only backend + DBs and run frontend locally:
   ```bash
   docker compose up -d user-db match-db redis user-service match-service config-service api-gateway
   cd frontend && npm ci && npm run dev
   ```
   Frontend dev server: http://localhost:5173 (proxies `/api` and `/ws-indichess` to 8080).

### Run backend only (no Docker)

1. Start MySQL (user DB on 3306 or 3307), MySQL (match DB), and Redis.
2. Set env (or use defaults in `application.yml` / `bootstrap.yml`):
   - User service: `SPRING_DATASOURCE_*`, `JWT_SECRET`, `JWT_TTL_SECONDS`, OAuth URLs if using Google.
   - Match service: `SPRING_DATASOURCE_*`, `REDIS_HOST`, `REDIS_PORT`, `USER_SERVICE_URL`, `JWT_SECRET`.
   - Gateway: `USER_SERVICE_URL`, `MATCH_SERVICE_URL`, `JWT_SECRET`.
3. Run from `backend`:
   ```bash
   mvn -pl user-service spring-boot:run
   mvn -pl match-service spring-boot:run
   mvn -pl api-gateway spring-boot:run
   ```
4. Run frontend (see [Development](#development)).

---

## Environment Variables

### Docker Compose (backend services)

| Service | Variable | Description |
|---------|----------|-------------|
| user-service | `SPRING_DATASOURCE_URL` | JDBC URL for user DB |
| user-service | `JWT_SECRET` | Secret for JWT (min 32 chars) |
| user-service | `JWT_TTL_SECONDS` | Token TTL (e.g. 18000) |
| user-service | `OAUTH2_*` | OAuth2 redirect URIs for Google |
| match-service | `SPRING_DATASOURCE_*` | Match DB |
| match-service | `REDIS_HOST`, `REDIS_PORT` | Redis for matchmaking queue |
| match-service | `USER_SERVICE_URL` | URL of user-service (for user info) |
| api-gateway | `USER_SERVICE_URL`, `MATCH_SERVICE_URL` | Backend service URLs |
| api-gateway | `JWT_SECRET` | Same as user-service |

### Frontend (build time)

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE` | Base URL of API (e.g. `http://localhost:8080`). If empty, dev proxy is used. |

---

## Kubernetes Deployment

Manifests in `k8s/` deploy the full stack (DBs, Redis, config-service, user-service, match-service, api-gateway, frontend) and an Ingress:

- `/api(...)` → api-gateway:8080  
- `/(...)` → frontend:80  

Apply in order (namespace, secrets, configmap, DBs, Redis, services, ingress). Adjust images, secrets, and ingress host/TLS as needed for your cluster.

---

## Development

### Frontend

```bash
cd frontend
npm ci
npm run dev      # http://localhost:5173, proxy to gateway :8080
npm run build
npm run preview  # serve dist
npm run lint
npm run test     # Vitest
```

### Backend

```bash
cd backend
mvn clean install
mvn -pl user-service spring-boot:run
mvn -pl match-service spring-boot:run
mvn -pl api-gateway spring-boot:run
```

Use the same `JWT_SECRET` and DB/Redis URLs as in docker-compose when running locally.

---

## Testing

- **Frontend:** `npm run test` in `frontend` (Vitest + jsdom); e.g. `ratings.test.js`.
- **Backend:** JUnit tests in `match-service` (e.g. `RatingServiceTest`); run with `mvn test` in the module or from `backend`.

---

## License & Author

- **License:** MIT  
- **Author:** Vikas Reddy  