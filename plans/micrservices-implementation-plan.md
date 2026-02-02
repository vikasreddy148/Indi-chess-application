# IndiChess Microservices Implementation Plan

## Executive Summary

This document outlines the comprehensive plan for migrating the IndiChess monolithic application to a microservices architecture. The current application is a Spring Boot monolith with React frontend, handling user management, matchmaking, and real-time chess gameplay via WebSockets.

**Current Architecture Analysis:**
- **Backend**: Spring Boot 4.0.1 (Java 17) monolithic application
- **Frontend**: React 19 with Vite, Tailwind CSS 4
- **Database**: Single MySQL 8.0 instance
- **Real-time**: Spring WebSocket with STOMP protocol
- **Security**: JWT authentication, OAuth2 (Google), Spring Security
- **Key Components**:
  - User management (registration, login, profiles)
  - Match management (matchmaking, game state)
  - Real-time gameplay (WebSocket-based moves)
  - Rating system

**Target Architecture:**
- **User Service**: Authentication, authorization, user profiles
- **Match Service**: Matchmaking, game logic, move validation, ratings
- **API Gateway**: Routing, load balancing, JWT validation
- **Config Service** (Optional): Centralized configuration management
- **Frontend**: React application (unchanged, will consume microservices)

---

## 1. Current Codebase Analysis

### 1.1 Backend Structure Analysis

**Current Package Structure:**
```
com.example.IndiChessBackend/
├── config/
│   ├── SecurityConfig.java
│   ├── WebSocketConfig.java
│   ├── JwtHandshakeInterceptor.java
│   ├── WebSocketAuthInterceptor.java
│   └── WebSocketPrincipalHandshakeHandler.java
├── controller/
│   ├── AuthController.java
│   ├── UserController.java
│   ├── MatchController.java
│   └── GameController.java
├── service/
│   ├── AuthService.java
│   ├── UserService.java
│   ├── JwtService.java
│   ├── MatchService.java
│   ├── GameService.java
│   ├── MatchQueueService.java
│   ├── ChallengeService.java
│   └── MyUserDetailsService.java
├── model/
│   ├── User.java
│   ├── Match.java
│   ├── Move.java
│   ├── Rating.java
│   ├── GameType.java
│   ├── MatchStatus.java
│   ├── PieceColor.java
│   └── DTO/
├── repo/
│   ├── UserRepo.java
│   ├── MatchRepo.java
│   ├── MoveRepo.java
│   └── RatingRepo.java
├── filters/
│   └── JwtFilter.java
├── exception/
│   ├── GlobalExceptionHandler.java
│   ├── ApiErrorResponse.java
│   └── DuplicateResourceException.java
└── oauth/
    └── OAuth2SuccessHandler.java
```

### 1.2 Key Features Identified

**User Management:**
- User registration and login
- JWT token generation and validation
- OAuth2 integration (Google)
- User profile management
- Password encryption (BCrypt)

**Match Management:**
- Match creation and matching
- Match queue service
- Game state management (FEN notation)
- Move validation and storage
- Match history

**Real-time Features:**
- WebSocket connections for live gameplay
- STOMP protocol for messaging
- Real-time move broadcasting
- Game state synchronization

**Database Schema:**
- `users` table: userId, username, emailId, password, pfpUrl, country, rating
- `matches` table: id, player1_id, player2_id, status, currentPly, fenCurrent, lastMoveUci, gameType, timestamps
- `moves` table: Linked to matches with ply ordering
- `ratings` table: User rating tracking

### 1.3 Dependencies Analysis

**Current Dependencies:**
- Spring Boot 4.0.1
- Spring Data JPA
- Spring Security
- Spring WebSocket
- Spring OAuth2 Client
- MySQL Connector
- JWT (jjwt 0.11.5)
- Lombok
- Validation

---

## 2. Microservices Architecture Design

### 2.1 Service Breakdown

#### **User Service**
**Responsibilities:**
- User registration and authentication
- JWT token generation
- User profile management
- OAuth2 integration
- Password management
- User search and listing (admin features)

**Database:** `user_service_db`
- users table
- roles table (if implementing RBAC)
- permissions table (if implementing RBAC)
- user_sessions table (for token blacklisting)

**Port:** 8081

#### **Match Service**
**Responsibilities:**
- Match creation and matchmaking
- Game logic and move validation
- Match state management
- Move storage and history
- Rating calculations (ELO)
- WebSocket endpoints for real-time gameplay
- Game statistics

**Database:** `match_service_db`
- matches table
- moves table
- ratings table (or could be in User Service)
- match_queue table (for matchmaking)

**Port:** 8082

#### **API Gateway**
**Responsibilities:**
- Request routing to appropriate services
- Load balancing
- JWT validation (global filter)
- CORS configuration
- Request/response logging
- Rate limiting (optional)
- Circuit breaker pattern (optional)

**Port:** 8080 (main entry point)

#### **Config Service** (Optional)
**Responsibilities:**
- Centralized configuration management
- Environment-specific configurations
- Dynamic configuration updates

**Port:** 8888

### 2.2 Communication Patterns

**Synchronous Communication:**
- REST APIs via API Gateway
- OpenFeign for service-to-service calls
- Service discovery (Kubernetes native or Consul)

**Asynchronous Communication:**
- RabbitMQ/Kafka (Optional) for events:
  - User registered
  - Match started/completed
  - Move made
  - User disconnected
  - Rating updated

**Real-time Communication:**
- WebSocket connections directly to Match Service
- STOMP protocol for messaging

### 2.3 Data Management Strategy

**Database per Service:**
- User Service: Own database for user data
- Match Service: Own database for match/game data
- No shared databases (maintains service boundaries)

**Shared Data:**
- User IDs referenced in Match Service (not foreign keys)
- Event-driven updates for eventual consistency

---

## 3. Project Structure

### 3.1 Root Directory Structure

```
Indi-chess-application/
├── .gitignore
├── README.md
├── docker-compose.yml                    # Local development (all services)
├── pom.xml                               # Parent POM for backend services
│
├── backend/                               # All backend microservices
│   ├── pom.xml                           # Backend parent POM
│   │
│   ├── user-service/
│   │   ├── pom.xml
│   │   ├── Dockerfile
│   │   ├── src/
│   │   │   ├── main/
│   │   │   │   ├── java/com/indichess/user/
│   │   │   │   │   ├── UserServiceApplication.java
│   │   │   │   │   ├── config/
│   │   │   │   │   │   ├── SecurityConfig.java
│   │   │   │   │   │   └── JwtConfig.java
│   │   │   │   │   ├── controller/
│   │   │   │   │   │   ├── AuthController.java
│   │   │   │   │   │   └── UserController.java
│   │   │   │   │   ├── service/
│   │   │   │   │   │   ├── AuthService.java
│   │   │   │   │   │   ├── UserService.java
│   │   │   │   │   │   ├── JwtService.java
│   │   │   │   │   │   └── MyUserDetailsService.java
│   │   │   │   │   ├── model/
│   │   │   │   │   │   ├── User.java
│   │   │   │   │   │   ├── Role.java
│   │   │   │   │   │   └── Permission.java
│   │   │   │   │   ├── repo/
│   │   │   │   │   │   ├── UserRepository.java
│   │   │   │   │   │   └── RoleRepository.java
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   ├── LoginRequest.java
│   │   │   │   │   │   ├── RegisterRequest.java
│   │   │   │   │   │   └── UserResponse.java
│   │   │   │   │   ├── exception/
│   │   │   │   │   │   └── GlobalExceptionHandler.java
│   │   │   │   │   └── oauth/
│   │   │   │   │       └── OAuth2SuccessHandler.java
│   │   │   │   └── resources/
│   │   │   │       ├── application.yml
│   │   │   │       ├── bootstrap.yml
│   │   │   │       └── db/migration/        # Flyway migrations
│   │   │   └── test/
│   │   └── target/
│   │
│   ├── match-service/
│   │   ├── pom.xml
│   │   ├── Dockerfile
│   │   ├── src/
│   │   │   ├── main/
│   │   │   │   ├── java/com/indichess/match/
│   │   │   │   │   ├── MatchServiceApplication.java
│   │   │   │   │   ├── config/
│   │   │   │   │   │   ├── WebSocketConfig.java
│   │   │   │   │   │   ├── JwtHandshakeInterceptor.java
│   │   │   │   │   │   └── WebSocketAuthInterceptor.java
│   │   │   │   │   ├── controller/
│   │   │   │   │   │   ├── MatchController.java
│   │   │   │   │   │   └── GameController.java
│   │   │   │   │   ├── service/
│   │   │   │   │   │   ├── MatchService.java
│   │   │   │   │   │   ├── GameService.java
│   │   │   │   │   │   ├── MatchQueueService.java
│   │   │   │   │   │   ├── MoveValidationService.java
│   │   │   │   │   │   └── RatingService.java
│   │   │   │   │   ├── model/
│   │   │   │   │   │   ├── Match.java
│   │   │   │   │   │   ├── Move.java
│   │   │   │   │   │   ├── Rating.java
│   │   │   │   │   │   ├── GameType.java
│   │   │   │   │   │   └── MatchStatus.java
│   │   │   │   │   ├── repo/
│   │   │   │   │   │   ├── MatchRepository.java
│   │   │   │   │   │   ├── MoveRepository.java
│   │   │   │   │   │   └── RatingRepository.java
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   ├── MatchRequest.java
│   │   │   │   │   │   ├── MoveRequest.java
│   │   │   │   │   │   └── MatchResponse.java
│   │   │   │   │   ├── websocket/
│   │   │   │   │   │   ├── GameWebSocketHandler.java
│   │   │   │   │   │   └── GameMessageController.java
│   │   │   │   │   ├── exception/
│   │   │   │   │   │   └── GlobalExceptionHandler.java
│   │   │   │   │   └── client/              # Feign clients
│   │   │   │   │       └── UserServiceClient.java
│   │   │   │   └── resources/
│   │   │   │       ├── application.yml
│   │   │   │       ├── bootstrap.yml
│   │   │   │       └── db/migration/
│   │   │   └── test/
│   │   └── target/
│   │
│   ├── api-gateway/
│   │   ├── pom.xml
│   │   ├── Dockerfile
│   │   ├── src/
│   │   │   ├── main/
│   │   │   │   ├── java/com/indichess/gateway/
│   │   │   │   │   ├── ApiGatewayApplication.java
│   │   │   │   │   ├── config/
│   │   │   │   │   │   ├── GatewayConfig.java
│   │   │   │   │   │   └── CorsConfig.java
│   │   │   │   │   ├── filter/
│   │   │   │   │   │   ├── JwtValidationFilter.java
│   │   │   │   │   │   └── RequestLoggingFilter.java
│   │   │   │   │   └── exception/
│   │   │   │   │       └── GlobalExceptionHandler.java
│   │   │   │   └── resources/
│   │   │   │       ├── application.yml
│   │   │   │       └── bootstrap.yml
│   │   │   └── test/
│   │   └── target/
│   │
│   ├── config-service/                      # Optional
│   │   ├── pom.xml
│   │   ├── Dockerfile
│   │   ├── src/
│   │   │   ├── main/
│   │   │   │   ├── java/com/indichess/config/
│   │   │   │   │   └── ConfigServiceApplication.java
│   │   │   │   └── resources/
│   │   │   │       └── application.yml
│   │   │   └── test/
│   │   └── target/
│   │
│   └── shared-lib/                          # Optional: Shared DTOs
│       ├── pom.xml
│       └── src/main/java/com/indichess/shared/
│           └── dto/
│               ├── ApiResponse.java
│               └── ErrorResponse.java
│
├── frontend/                                # React frontend application
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── index.html
│   ├── README.md
│   ├── src/
│   │   ├── main.jsx
│   │   ├── api/
│   │   │   ├── auth.js
│   │   │   ├── client.js
│   │   │   └── api.js
│   │   ├── auth/
│   │   │   └── AuthContext.jsx
│   │   ├── chess/
│   │   │   ├── board.js
│   │   │   ├── legalMoves.js
│   │   │   └── state.js
│   │   ├── config/
│   │   │   └── api.js
│   │   ├── pages/
│   │   │   ├── App.jsx
│   │   │   ├── GamePage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   └── LocalGamePage.jsx
│   │   ├── styles/
│   │   │   ├── auth.css
│   │   │   ├── gamepage.css
│   │   │   ├── global.css
│   │   │   ├── home.css
│   │   │   └── landing.css
│   │   └── ws/
│   │       └── stompClient.js
│   ├── dist/                                # Build output
│   └── node_modules/
│
├── plans/                                   # Documentation and plans
│   └── micrservices-implementation-plan.md
│
└── k8s/                                     # Kubernetes manifests
    ├── namespace.yaml
    ├── backend/
    │   ├── user-service/
    │   │   ├── deployment.yaml
    │   │   ├── service.yaml
    │   │   ├── configmap.yaml
    │   │   └── secret.yaml
    │   ├── match-service/
    │   │   ├── deployment.yaml
    │   │   ├── service.yaml
    │   │   ├── configmap.yaml
    │   │   └── secret.yaml
    │   ├── api-gateway/
    │   │   ├── deployment.yaml
    │   │   ├── service.yaml
    │   │   ├── configmap.yaml
    │   │   └── ingress.yaml
    │   └── config-service/                  # Optional
    │       ├── deployment.yaml
    │       └── service.yaml
    └── frontend/
        ├── deployment.yaml
        ├── service.yaml
        └── configmap.yaml
```

### 3.2 Parent POM Structure

**Root POM** (`/pom.xml`):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.indichess</groupId>
    <artifactId>indichess-root</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>pom</packaging>
    
    <modules>
        <module>backend</module>
    </modules>
    
    <properties>
        <java.version>17</java.version>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
</project>
```

**Backend Parent POM** (`/backend/pom.xml`):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.indichess</groupId>
    <artifactId>indichess-backend-parent</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>pom</packaging>
    
    <parent>
        <groupId>com.indichess</groupId>
        <artifactId>indichess-root</artifactId>
        <version>1.0.0-SNAPSHOT</version>
        <relativePath>../pom.xml</relativePath>
    </parent>
    
    <modules>
        <module>user-service</module>
        <module>match-service</module>
        <module>api-gateway</module>
        <module>config-service</module>
        <module>shared-lib</module>
    </modules>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>4.0.1</version>
    </parent>
    
    <properties>
        <java.version>17</java.version>
        <spring-cloud.version>2024.0.0</spring-cloud.version>
        <jwt.version>0.11.5</jwt.version>
    </properties>
    
    <dependencyManagement>
        <dependencies>
            <!-- Spring Cloud Dependencies -->
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
</project>
```

---

## 4. Detailed Implementation Plan

### WEEK 1-2: Repository & Project Setup

#### Day 1-2: Repository & Project Setup

**Tasks:**
1. Create GitHub repository structure
2. Create root directory structure:
   - `backend/` folder for all microservices
   - `frontend/` folder for React application
   - `plans/` folder for documentation
   - `k8s/` folder for Kubernetes manifests
3. Initialize root POM (`/pom.xml`) and backend parent POM (`/backend/pom.xml`) with dependency management
4. Create backend service directories under `backend/`:
   - `backend/user-service/`
   - `backend/match-service/`
   - `backend/api-gateway/`
   - `backend/config-service/` (optional)
   - `backend/shared-lib/` (optional)
5. Initialize each backend service from start.spring.io with dependencies:
   - **User Service**: Web, Security, JPA, MySQL, OAuth2 Client, Validation
   - **Match Service**: Web, WebSocket, JPA, MySQL, OpenFeign
   - **API Gateway**: Gateway, Security, Discovery Client
   - **Config Service**: Config Server
5. Set up `.gitignore` for Java/IDE/Docker files
6. Create basic README with project overview

**Deliverables:**
- Parent POM configured
- All service projects initialized
- Basic project structure in place

---

### WEEK 3: Configuration Service Setup (Optional)

#### Day 3-4: Configuration Service Setup

**Tasks:**
1. Create separate `config-repo` Git repository
2. Add base `application.yml` with common properties:
   ```yaml
   server:
     port: 8888
   spring:
     application:
       name: config-service
     cloud:
       config:
         server:
           git:
             uri: <config-repo-url>
   ```
3. Create service-specific config files:
   - `user-service.yml`
   - `match-service.yml`
   - `api-gateway.yml`
   - `config-service.yml`
4. Test Config Service locally with Git backend
5. Add `bootstrap.properties` to all services:
   ```properties
   spring.application.name=user-service
   spring.cloud.config.uri=http://localhost:8888
   spring.cloud.config.enabled=true
   ```

**Deliverables:**
- Config Service running
- Configuration files in Git repository
- All services connected to Config Service

---

### WEEK 4: Database Setup & Initial Schema

#### Day 5-7: Database Setup & Initial Schema

**Tasks:**

**User Service Database:**
1. Create local MySQL instance: `user_service_db`
2. Design schema:
   ```sql
   CREATE TABLE users (
       user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
       username VARCHAR(50) UNIQUE NOT NULL,
       email_id VARCHAR(255) UNIQUE NOT NULL,
       password VARCHAR(512) NOT NULL,
       pfp_url VARCHAR(512),
       country VARCHAR(100),
       rating INT DEFAULT 1200,
       status ENUM('ACTIVE', 'INACTIVE', 'BANNED') DEFAULT 'ACTIVE',
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );
   
   CREATE TABLE roles (
       role_id BIGINT PRIMARY KEY AUTO_INCREMENT,
       name VARCHAR(50) UNIQUE NOT NULL
   );
   
   CREATE TABLE user_roles (
       user_id BIGINT,
       role_id BIGINT,
       PRIMARY KEY (user_id, role_id),
       FOREIGN KEY (user_id) REFERENCES users(user_id),
       FOREIGN KEY (role_id) REFERENCES roles(role_id)
   );
   
   CREATE TABLE user_sessions (
       session_id VARCHAR(255) PRIMARY KEY,
       user_id BIGINT NOT NULL,
       token_hash VARCHAR(512) NOT NULL,
       expires_at TIMESTAMP NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (user_id) REFERENCES users(user_id)
   );
   ```
3. Create Flyway migration files
4. Add initialization scripts

**Match Service Database:**
1. Create local MySQL instance: `match_service_db`
2. Design schema:
   ```sql
   CREATE TABLE matches (
       id BIGINT PRIMARY KEY AUTO_INCREMENT,
       player1_id BIGINT NOT NULL,
       player2_id BIGINT NOT NULL,
       status ENUM('ONGOING', 'PLAYER1_WON', 'PLAYER2_WON', 'DRAW', 'ABANDONED') DEFAULT 'ONGOING',
       current_ply INT DEFAULT 0,
       fen_current VARCHAR(200) NOT NULL,
       last_move_uci VARCHAR(10),
       game_type ENUM('CLASSICAL', 'RAPID', 'BLITZ', 'BULLET') NOT NULL,
       started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       finished_at TIMESTAMP NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
       INDEX idx_player1 (player1_id),
       INDEX idx_player2 (player2_id),
       INDEX idx_status (status)
   );
   
   CREATE TABLE moves (
       move_id BIGINT PRIMARY KEY AUTO_INCREMENT,
       match_id BIGINT NOT NULL,
       ply INT NOT NULL,
       move_notation VARCHAR(10) NOT NULL,
       from_square VARCHAR(2) NOT NULL,
       to_square VARCHAR(2) NOT NULL,
       piece_type VARCHAR(1),
       is_capture BOOLEAN DEFAULT FALSE,
       is_check BOOLEAN DEFAULT FALSE,
       is_checkmate BOOLEAN DEFAULT FALSE,
       fen_after VARCHAR(200),
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
       INDEX idx_match_ply (match_id, ply)
   );
   
   CREATE TABLE ratings (
       rating_id BIGINT PRIMARY KEY AUTO_INCREMENT,
       user_id BIGINT NOT NULL,
       game_type ENUM('CLASSICAL', 'RAPID', 'BLITZ', 'BULLET') NOT NULL,
       rating INT DEFAULT 1200,
       games_played INT DEFAULT 0,
       wins INT DEFAULT 0,
       losses INT DEFAULT 0,
       draws INT DEFAULT 0,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
       UNIQUE KEY unique_user_game_type (user_id, game_type),
       INDEX idx_user_id (user_id)
   );
   
   CREATE TABLE match_queue (
       queue_id BIGINT PRIMARY KEY AUTO_INCREMENT,
       user_id BIGINT NOT NULL,
       game_type ENUM('CLASSICAL', 'RAPID', 'BLITZ', 'BULLET') NOT NULL,
       rating INT NOT NULL,
       joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       INDEX idx_game_type_rating (game_type, rating)
   );
   ```
3. Create Flyway migration files
4. Add initialization scripts

**Deliverables:**
- Two separate MySQL databases configured
- Database schemas designed and implemented
- Migration scripts ready
- Initial data seeders (if needed)

---

### WEEK 5-7: USER SERVICE DEVELOPMENT

#### Day 1-3: Core User Entities & Repositories

**Tasks:**
1. Create User entity with fields:
   - id, email, username, password, roles, status
   - pfpUrl, country, rating
   - timestamps (createdAt, updatedAt)
2. Create Role and Permission entities for authorization
3. Implement JPA repositories:
   - `UserRepository extends JpaRepository<User, Long>`
   - `RoleRepository extends JpaRepository<Role, Long>`
   - Custom query methods for finding by email/username
4. Add validation annotations:
   - `@Email`, `@Size`, `@NotNull`, `@UniqueElements`
5. Create initial data seeders for roles/permissions:
   - ROLE_USER, ROLE_ADMIN
   - Basic permissions

**Code Structure:**
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;
    
    @Column(unique = true, nullable = false)
    @Size(min = 4, max = 50)
    private String username;
    
    @Column(unique = true, nullable = false)
    @Email
    private String emailId;
    
    @Column(nullable = false)
    @Size(min = 6)
    private String password;
    
    private String pfpUrl;
    private String country;
    private Integer rating = 1200;
    
    @Enumerated(EnumType.STRING)
    private UserStatus status = UserStatus.ACTIVE;
    
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();
    
    // Timestamps, constructors, getters/setters
}
```

**Deliverables:**
- User, Role, Permission entities created
- Repositories implemented
- Validation in place
- Initial data seeded

---

#### Day 4-6: Authentication System

**Tasks:**
1. Implement `UserDetailsService` for Spring Security:
   ```java
   @Service
   public class MyUserDetailsService implements UserDetailsService {
       @Override
       public UserDetails loadUserByUsername(String username) {
           // Load user and convert to UserDetails
       }
   }
   ```
2. Create JWT utility class:
   - Token generation
   - Token validation
   - Token expiration handling
   - Claims extraction
3. Implement login endpoint:
   - Validate credentials
   - Generate JWT token
   - Return token in response
4. Add password encryption with BCrypt
5. Create registration endpoint:
   - Validate input
   - Check for duplicate email/username
   - Hash password
   - Save user
   - Generate and return JWT
6. Implement logout mechanism:
   - Token blacklist (store in database or Redis)
   - Invalidate session

**Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

**Deliverables:**
- Complete authentication flow
- JWT token generation and validation
- Registration and login endpoints working
- Logout mechanism implemented

---

#### Day 7-9: Authorization & Security

**Tasks:**
1. Configure Spring Security with JWT filter:
   ```java
   @Configuration
   @EnableWebSecurity
   public class SecurityConfig {
       // JWT filter configuration
       // Security filter chain
       // Password encoder
   }
   ```
2. Implement role-based endpoint protection:
   - `@PreAuthorize("hasRole('ADMIN')")`
   - `@PreAuthorize("hasRole('USER')")`
3. Add OAuth2 configuration for Google/GitHub:
   - OAuth2 client registration
   - Success handler
   - User info mapping
4. Create custom security exceptions:
   - `UnauthorizedException`
   - `ForbiddenException`
   - `TokenExpiredException`
5. Add rate limiting per user/IP (Optional):
   - Use Spring Cloud Gateway rate limiter
   - Or implement custom filter
6. Implement password reset flow (Can be added later):
   - Generate reset token
   - Send email
   - Validate token
   - Update password

**Deliverables:**
- Spring Security fully configured
- Role-based access control working
- OAuth2 integration complete
- Security exceptions handled

---

#### Day 10-12: Profile & Admin Features (Optional)

**Tasks:**
1. Create user profile management endpoints:
   - `GET /api/users/profile` - Get current user profile
   - `PUT /api/users/profile` - Update profile
   - `GET /api/users/{id}` - Get user by ID
2. Implement user search and listing (admin only):
   - `GET /api/users?page=0&size=20&sort=username`
   - Search by username/email
3. Add user statistics tracking:
   - Games played, wins, losses
   - Rating history
4. Create audit logging for security events:
   - Login attempts
   - Password changes
   - Role changes
5. Implement email service integration (Optional):
   - Welcome emails
   - Password reset emails
   - Account verification
6. Add account verification flow (Optional):
   - Email verification token
   - Account activation

**Endpoints:**
- `GET /api/users/profile` - Current user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users` - List users (admin)
- `GET /api/users/stats` - User statistics

**Deliverables:**
- Profile management complete
- Admin features implemented
- Statistics tracking working

---

#### Day 13-14: Testing & Documentation

**Tasks:**
1. Write unit tests for all service methods:
   - `AuthServiceTest`
   - `UserServiceTest`
   - `JwtServiceTest`
2. Create integration tests for endpoints:
   - `AuthControllerIntegrationTest`
   - `UserControllerIntegrationTest`
3. Generate OpenAPI documentation:
   - Add SpringDoc OpenAPI dependency
   - Configure Swagger UI
   - Document all endpoints
4. Test full authentication flow:
   - Registration → Login → Access protected resource
   - OAuth2 flow
   - Token refresh
5. Create Postman collection for User Service:
   - All endpoints
   - Test scenarios
   - Environment variables

**Deliverables:**
- Comprehensive test coverage
- API documentation generated
- Postman collection ready
- All tests passing

---

### WEEK 8-10: MATCH SERVICE DEVELOPMENT

#### Day 1-3: Match Entity & Game Logic

**Tasks:**
1. Create Match entity:
   - id, player1_id, player2_id, status, type, time control
   - currentPly, fenCurrent, lastMoveUci
   - timestamps
2. Create Move entity:
   - id, match_id, player, move notation, timestamp
   - fromSquare, toSquare, pieceType
   - isCapture, isCheck, isCheckmate
   - fenAfter
3. Implement chess game logic class:
   - Board state management
   - Move generation
   - Check/checkmate detection
   - Draw detection (stalemate, threefold repetition, etc.)
4. Create move validation service:
   - Validate move legality
   - Check if move is in legal moves list
   - Validate turn (white/black)
5. Add game state persistence:
   - Save FEN after each move
   - Update match status
   - Store move history

**Code Structure:**
```java
@Service
public class ChessGameLogic {
    public boolean isValidMove(String fen, String moveUci) {
        // Validate move using chess library or custom logic
    }
    
    public String makeMove(String fen, String moveUci) {
        // Apply move and return new FEN
    }
    
    public boolean isCheck(String fen, boolean isWhite) {
        // Check if king is in check
    }
    
    public boolean isCheckmate(String fen, boolean isWhite) {
        // Check if checkmate
    }
    
    public boolean isDraw(String fen) {
        // Check for draw conditions
    }
}
```

**Deliverables:**
- Match and Move entities created
- Chess game logic implemented
- Move validation working
- Game state persistence functional

---

#### Day 4-6: HTTP Classical Mode

**Tasks:**
1. Create REST endpoints for classical matches:
   - `POST /api/matches/create` - Create new match
   - `POST /api/matches/{id}/move` - Make a move
   - `GET /api/matches/{id}` - Get match details
   - `GET /api/matches/{id}/history` - Get move history
   - `POST /api/matches/{id}/resign` - Resign match
   - `POST /api/matches/{id}/draw` - Offer/accept draw
2. Implement matchmaking queue system:
   - `POST /api/matchmaking/join` - Join queue
   - `POST /api/matchmaking/leave` - Leave queue
   - Background service to match players
   - Rating-based matching algorithm
3. Add game history retrieval:
   - Get all matches for a user
   - Filter by status, game type
   - Pagination support
4. Implement draw/forfeit/resign endpoints
5. Create match statistics endpoints:
   - `GET /api/matches/stats/{userId}` - User match statistics
6. Add ELO rating calculation:
   - Calculate rating change after match
   - Update user ratings
   - Store rating history

**Endpoints:**
- `POST /api/matches/create` - Create match
- `POST /api/matches/{id}/move` - Make move
- `GET /api/matches/{id}` - Get match
- `GET /api/matches/user/{userId}` - User's matches
- `POST /api/matchmaking/join` - Join queue
- `POST /api/matchmaking/leave` - Leave queue
- `POST /api/matches/{id}/resign` - Resign
- `POST /api/matches/{id}/draw` - Draw offer

**Deliverables:**
- All REST endpoints implemented
- Matchmaking queue working
- Rating system functional
- Game history accessible

---

#### Day 7-10: WebSocket Setup & Configuration

**Tasks:**
1. Add Spring WebSocket dependency and configuration:
   ```java
   @Configuration
   @EnableWebSocketMessageBroker
   public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
       // Configure STOMP endpoints
       // Set message broker
       // Configure CORS
   }
   ```
2. Set up STOMP protocol over WebSocket:
   - Configure STOMP endpoints
   - Set message prefixes
   - Configure destination prefixes
3. Configure Redis for WebSocket session management:
   - Store active sessions
   - Handle session replication
   - Session cleanup on disconnect
4. Create WebSocket authentication interceptor:
   - Validate JWT token on connection
   - Extract user information
   - Set principal
5. Implement connection event handlers:
   - `onConnect` - Log connection
   - `onDisconnect` - Clean up, handle abandonment
   - `onError` - Error handling
6. Add WebSocket message brokers:
   - Configure message broker
   - Set up topic subscriptions
   - Handle message routing

**Configuration:**
```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-indichess")
                .setAllowedOrigins("*")
                .withSockJS();
    }
}
```

**Deliverables:**
- WebSocket configured
- STOMP protocol working
- Authentication integrated
- Session management functional

---

#### Day 11-13: Real-time Game Implementation

**Tasks:**
1. Create WebSocket endpoints for rapid/blitz games:
   - `/app/game/{matchId}/move` - Send move
   - `/app/game/{matchId}/resign` - Resign
   - `/app/game/{matchId}/draw` - Offer draw
   - `/topic/game/{matchId}` - Receive game updates
2. Implement real-time move broadcasting:
   - Broadcast move to both players
   - Update game state
   - Validate move server-side
3. Add chess clock/timer logic:
   - Track time per player
   - Handle time expiration
   - Broadcast time updates
4. Create disconnection/reconnection handling:
   - Detect disconnection
   - Store game state
   - Allow reconnection
   - Handle abandonment
5. Implement game state synchronization:
   - Send full game state on connection
   - Sync board position
   - Sync move history
6. Add spectator mode support:
   - Allow spectators to join
   - Broadcast to spectators
   - Limit spectator count

**WebSocket Message Types:**
```java
// Client → Server
{
    "type": "MOVE",
    "matchId": 123,
    "moveUci": "e2e4"
}

// Server → Client
{
    "type": "MOVE_MADE",
    "matchId": 123,
    "move": {...},
    "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    "currentPlayer": "WHITE",
    "gameStatus": "ONGOING"
}
```

**Deliverables:**
- Real-time gameplay working
- Chess clock implemented
- Reconnection handling complete
- Spectator mode functional

---

#### Day 14: Testing & Optimization

**Tasks:**
1. Test WebSocket connections locally:
   - Multiple concurrent connections
   - Move broadcasting
   - Disconnection scenarios
2. Implement load testing for WebSocket:
   - Use tools like JMeter or Gatling
   - Test with 100+ concurrent connections
   - Measure latency
3. Optimize database queries for real-time needs:
   - Add indexes
   - Use query optimization
   - Implement caching
4. Add caching for frequently accessed data:
   - Redis for match state
   - Cache user ratings
   - Cache active matches
5. Create performance benchmarks:
   - Move processing time
   - WebSocket message latency
   - Database query performance

**Deliverables:**
- Load testing completed
- Performance optimized
- Caching implemented
- Benchmarks documented

---

### WEEK 11-12: API GATEWAY DEVELOPMENT

#### Day 1-3: Gateway Configuration

**Tasks:**
1. Set up route definitions in `application.yml`:
   ```yaml
   spring:
     cloud:
       gateway:
         routes:
           - id: user-service
             uri: http://user-service:8081
             predicates:
               - Path=/api/users/**, /api/auth/**
           - id: match-service
             uri: http://match-service:8082
             predicates:
               - Path=/api/matches/**, /api/matchmaking/**
   ```
2. Configure load balancing between service instances:
   - Use Kubernetes service discovery
   - Or use Spring Cloud LoadBalancer
3. Add JWT validation global filter:
   - Validate token on all protected routes
   - Extract user information
   - Forward to services
4. Implement request/response logging:
   - Log all requests
   - Log response times
   - Log errors
5. Configure CORS for frontend communication:
   - Allow frontend origin
   - Configure allowed methods
   - Configure allowed headers

**Configuration:**
```java
@Configuration
public class GatewayConfig {
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            .route("user-service", r -> r
                .path("/api/users/**", "/api/auth/**")
                .uri("lb://user-service"))
            .route("match-service", r -> r
                .path("/api/matches/**", "/api/matchmaking/**")
                .uri("lb://match-service"))
            .build();
    }
}
```

**Deliverables:**
- Routes configured
- Load balancing working
- JWT validation functional
- CORS configured

---

#### Day 4-5: Security & Rate Limiting (Optional)

**Tasks:**
1. Add rate limiting per IP and user:
   - Use Redis for rate limiting
   - Configure limits per endpoint
   - Return 429 Too Many Requests
2. Implement circuit breaker pattern with Resilience4J:
   - Configure circuit breakers for each service
   - Handle service failures gracefully
   - Fallback responses
3. Create custom gateway filters for authorization:
   - Check user roles
   - Validate permissions
   - Route based on authorization
4. Add request header validation:
   - Validate required headers
   - Sanitize headers
5. Implement request size limits:
   - Limit request body size
   - Limit file upload size

**Deliverables:**
- Rate limiting implemented
- Circuit breakers configured
- Security filters in place

---

#### Day 6-7: Monitoring & Tracing (Optional)

**Tasks:**
1. Configure Spring Cloud Sleuth for distributed tracing:
   - Add trace IDs to requests
   - Correlate logs across services
2. Add metrics endpoint for monitoring:
   - Use Micrometer
   - Expose metrics
3. Implement custom gateway metrics:
   - Request count
   - Response times
   - Error rates
4. Create health check endpoints:
   - `/actuator/health`
   - Service-specific health checks
5. Add request/response time tracking:
   - Log slow requests
   - Alert on high latency

**Deliverables:**
- Distributed tracing working
- Metrics exposed
- Health checks functional

---

### WEEK 13: SERVICE INTEGRATION & COMMUNICATION

#### Day 1-2: Synchronous Communication

**Tasks:**
1. Configure OpenFeign for service-to-service calls:
   ```java
   @FeignClient(name = "user-service", url = "${user.service.url}")
   public interface UserServiceClient {
       @GetMapping("/api/users/{userId}")
       UserResponse getUser(@PathVariable Long userId);
   }
   ```
2. Create shared DTOs library:
   - Common response wrappers
   - Error response formats
   - User DTOs (for inter-service communication)
   - Match DTOs (for inter-service communication)
3. Implement error handling for inter-service calls:
   - Retry logic
   - Fallback mechanisms
   - Error propagation
4. Add request timeouts and retries:
   - Configure timeout values
   - Implement retry with exponential backoff
   - Handle circuit breaker scenarios
5. Create service discovery abstraction for K8s:
   - Use Kubernetes service names
   - Configure service URLs
   - Handle service resolution

**Code Example:**
```java
@FeignClient(
    name = "user-service",
    url = "${user.service.url:http://user-service:8081}",
    fallback = UserServiceClientFallback.class
)
public interface UserServiceClient {
    @GetMapping("/api/users/{userId}")
    UserResponse getUser(@PathVariable Long userId);
    
    @GetMapping("/api/users/{userId}/exists")
    Boolean userExists(@PathVariable Long userId);
}
```

**Deliverables:**
- OpenFeign clients configured
- Shared DTOs library created
- Error handling implemented
- Service discovery working

---

#### Day 3-4: Asynchronous Events (Optional)

**Tasks:**
1. Set up RabbitMQ/Kafka messaging system:
   - Install and configure message broker
   - Create exchanges/topics
   - Set up queues
2. Define event schemas:
   ```java
   public class UserRegisteredEvent {
       private Long userId;
       private String username;
       private String email;
       private LocalDateTime timestamp;
   }
   
   public class MatchStartedEvent {
       private Long matchId;
       private Long player1Id;
       private Long player2Id;
       private GameType gameType;
       private LocalDateTime startedAt;
   }
   
   public class MatchCompletedEvent {
       private Long matchId;
       private Long winnerId;
       private MatchStatus status;
       private LocalDateTime completedAt;
   }
   
   public class MoveMadeEvent {
       private Long matchId;
       private Long playerId;
       private String moveUci;
       private Integer ply;
       private LocalDateTime timestamp;
   }
   
   public class UserDisconnectedEvent {
       private Long userId;
       private Long matchId;
       private LocalDateTime disconnectedAt;
   }
   
   public class RatingUpdatedEvent {
       private Long userId;
       private GameType gameType;
       private Integer oldRating;
       private Integer newRating;
       private LocalDateTime updatedAt;
   }
   ```
3. Create event producers in each service:
   - User Service: UserRegisteredEvent
   - Match Service: MatchStartedEvent, MatchCompletedEvent, MoveMadeEvent, RatingUpdatedEvent
4. Implement event consumers:
   - User Service: Listen for rating updates
   - Match Service: Listen for user events
   - Analytics Service (if created): Listen to all events
5. Add dead letter queue handling:
   - Configure DLQ for failed messages
   - Implement retry logic
   - Log failed events

**Configuration:**
```yaml
spring:
  rabbitmq:
    host: ${RABBITMQ_HOST:localhost}
    port: ${RABBITMQ_PORT:5672}
    username: ${RABBITMQ_USER:guest}
    password: ${RABBITMQ_PASS:guest}
```

**Deliverables:**
- Message broker configured
- Event schemas defined
- Producers and consumers implemented
- Dead letter queue handling

---

#### Day 5-7: End-to-End Testing

**Tasks:**
1. Test complete user registration → match creation flow:
   - Register user
   - Login
   - Join matchmaking queue
   - Create match
   - Make moves
   - Complete match
2. Test WebSocket game with multiple players:
   - Multiple concurrent games
   - Real-time move broadcasting
   - Disconnection handling
3. Test service failure scenarios:
   - User Service down
   - Match Service down
   - Database connection failures
4. Verify circuit breaker functionality:
   - Trigger circuit breaker
   - Verify fallback responses
   - Test recovery
5. Test rate limiting in production-like conditions:
   - Exceed rate limits
   - Verify 429 responses
   - Test rate limit reset

**Test Scenarios:**
- Happy path: Full game flow
- Error scenarios: Service failures, network issues
- Load testing: Multiple concurrent users
- Security testing: JWT validation, authorization
- Integration testing: Service-to-service communication

**Deliverables:**
- End-to-end tests passing
- Failure scenarios handled
- Performance benchmarks met
- Security validated

---

### WEEK 14-15: DOCKER & KUBERNETES SETUP

#### Day 1-2: Dockerization

**Tasks:**
1. Create Dockerfile for each service:
   ```dockerfile
   # Example: user-service/Dockerfile
   FROM openjdk:17-jdk-slim
   WORKDIR /app
   COPY target/user-service-*.jar app.jar
   EXPOSE 8081
   ENTRYPOINT ["java", "-jar", "app.jar"]
   ```
2. Configure Jib for automated Docker builds:
   ```xml
   <plugin>
       <groupId>com.google.cloud.tools</groupId>
       <artifactId>jib-maven-plugin</artifactId>
       <version>3.4.0</version>
       <configuration>
           <to>
               <image>indichess/${project.artifactId}:${project.version}</image>
           </to>
       </configuration>
   </plugin>
   ```
3. Create docker-compose.yml for local development (at root level):
   ```yaml
   version: '3.8'
   services:
     user-service:
       build: ./backend/user-service
       ports:
         - "8081:8081"
       environment:
         - SPRING_DATASOURCE_URL=jdbc:mysql://user-db:3306/user_service_db
       depends_on:
         - user-db
       networks:
         - indichess-network
     
     match-service:
       build: ./backend/match-service
       ports:
         - "8082:8082"
       environment:
         - SPRING_DATASOURCE_URL=jdbc:mysql://match-db:3306/match_service_db
       depends_on:
         - match-db
       networks:
         - indichess-network
     
     api-gateway:
       build: ./backend/api-gateway
       ports:
         - "8080:8080"
       depends_on:
         - user-service
         - match-service
       networks:
         - indichess-network
     
     frontend:
       build: ./frontend
       ports:
         - "3000:80"
       depends_on:
         - api-gateway
       networks:
         - indichess-network
     
     user-db:
       image: mysql:8.0
       container_name: indichess-user-db
       environment:
         MYSQL_ROOT_PASSWORD: root
         MYSQL_DATABASE: user_service_db
       volumes:
         - user_db_data:/var/lib/mysql
       ports:
         - "3307:3306"
       networks:
         - indichess-network
     
     match-db:
       image: mysql:8.0
       container_name: indichess-match-db
       environment:
         MYSQL_ROOT_PASSWORD: root
         MYSQL_DATABASE: match_service_db
       volumes:
         - match_db_data:/var/lib/mysql
       ports:
         - "3308:3306"
       networks:
         - indichess-network
     
     redis:
       image: redis:7-alpine
       container_name: indichess-redis
       ports:
         - "6379:6379"
       networks:
         - indichess-network
     
   networks:
     indichess-network:
       driver: bridge
   
   volumes:
     user_db_data:
     match_db_data:
   ```
4. Test all services in Docker locally:
   - Build images
   - Start containers
   - Verify connectivity
   - Test endpoints
5. Optimize Docker images for size:
   - Use multi-stage builds
   - Remove unnecessary dependencies
   - Use slim base images

**Deliverables:**
- Dockerfiles created for all services
- docker-compose.yml working
- All services containerized
- Images optimized

---

#### Day 3-5: Kubernetes Manifests

**Tasks:**
1. Create namespace definitions:
   ```yaml
   # k8s/namespace.yaml
   apiVersion: v1
   kind: Namespace
   metadata:
     name: indichess
   ```
2. Write Deployment manifests for all services:
   ```yaml
   # k8s/backend/user-service/deployment.yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: user-service
     namespace: indichess
   spec:
     replicas: 2
     selector:
       matchLabels:
         app: user-service
     template:
       metadata:
         labels:
           app: user-service
       spec:
         containers:
         - name: user-service
           image: indichess/user-service:1.0.0
           ports:
           - containerPort: 8081
           env:
           - name: SPRING_DATASOURCE_URL
             valueFrom:
               secretKeyRef:
                 name: user-service-secret
                 key: datasource-url
           resources:
             requests:
               memory: "512Mi"
               cpu: "500m"
             limits:
               memory: "1Gi"
               cpu: "1000m"
           livenessProbe:
             httpGet:
               path: /actuator/health
               port: 8081
             initialDelaySeconds: 60
             periodSeconds: 10
           readinessProbe:
             httpGet:
               path: /actuator/health/readiness
               port: 8081
             initialDelaySeconds: 30
             periodSeconds: 5
   ```
3. Create Service definitions (ClusterIP):
   ```yaml
   # k8s/user-service/service.yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: user-service
     namespace: indichess
   spec:
     selector:
       app: user-service
     ports:
     - protocol: TCP
       port: 8081
       targetPort: 8081
     type: ClusterIP
   ```
4. Write ConfigMap for application properties:
   ```yaml
   # k8s/user-service/configmap.yaml
   apiVersion: v1
   kind: ConfigMap
   metadata:
     name: user-service-config
     namespace: indichess
   data:
     application.yml: |
       server:
         port: 8081
       spring:
         application:
           name: user-service
         datasource:
           url: ${SPRING_DATASOURCE_URL}
           username: ${SPRING_DATASOURCE_USERNAME}
           password: ${SPRING_DATASOURCE_PASSWORD}
   ```
5. Create Secret manifests for sensitive data:
   ```yaml
   # k8s/user-service/secret.yaml
   apiVersion: v1
   kind: Secret
   metadata:
     name: user-service-secret
     namespace: indichess
   type: Opaque
   stringData:
     datasource-url: jdbc:mysql://cloud-sql-proxy:3306/user_service_db
     datasource-username: root
     datasource-password: <password>
     jwt-secret: <jwt-secret-key>
   ```
6. Set up Ingress with SSL configuration:
   ```yaml
   # k8s/api-gateway/ingress.yaml
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
     name: indichess-ingress
     namespace: indichess
     annotations:
       kubernetes.io/ingress.class: "gce"
       kubernetes.io/ingress.global-static-ip-name: "indichess-ip"
       networking.gke.io/managed-certificates: "indichess-ssl-cert"
   spec:
     rules:
     - host: api.indichess.com
       http:
         paths:
         - path: /*
           pathType: ImplementationSpecific
           backend:
             service:
               name: api-gateway
               port:
                 number: 8080
   ```

**Deliverables:**
- All Kubernetes manifests created
- ConfigMaps and Secrets configured
- Ingress set up
- Ready for deployment

---

#### Day 6-7: GKE Deployment

**Tasks:**
1. Set up GKE cluster with appropriate node pools:
   ```bash
   gcloud container clusters create indichess-cluster \
     --zone us-central1-a \
     --num-nodes 3 \
     --machine-type n1-standard-2 \
     --enable-autoscaling \
     --min-nodes 2 \
     --max-nodes 5
   ```
2. Configure Cloud SQL for MySQL databases:
   - Create Cloud SQL instances for user-service and match-service
   - Set up Cloud SQL Proxy
   - Configure connection strings
3. Set up Memorystore for Redis:
   - Create Redis instance
   - Configure connection
   - Update services to use Redis
4. Deploy all services to GKE:
   ```bash
   kubectl apply -f k8s/namespace.yaml
   kubectl apply -f k8s/backend/user-service/
   kubectl apply -f k8s/backend/match-service/
   kubectl apply -f k8s/backend/api-gateway/
   kubectl apply -f k8s/frontend/
   ```
5. Configure GKE Ingress with SSL:
   - Set up managed SSL certificate
   - Configure static IP
   - Update DNS records
6. Test full deployment:
   - Verify all pods are running
   - Test service connectivity
   - Test external access
   - Verify SSL certificates

**Deployment Commands:**
```bash
# Build and push backend service images
docker build -t gcr.io/PROJECT_ID/user-service:1.0.0 ./backend/user-service
docker push gcr.io/PROJECT_ID/user-service:1.0.0

docker build -t gcr.io/PROJECT_ID/match-service:1.0.0 ./backend/match-service
docker push gcr.io/PROJECT_ID/match-service:1.0.0

docker build -t gcr.io/PROJECT_ID/api-gateway:1.0.0 ./backend/api-gateway
docker push gcr.io/PROJECT_ID/api-gateway:1.0.0

# Build and push frontend image
docker build -t gcr.io/PROJECT_ID/frontend:1.0.0 ./frontend
docker push gcr.io/PROJECT_ID/frontend:1.0.0

# Apply Kubernetes manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n indichess
kubectl get services -n indichess
kubectl get ingress -n indichess
```

**Deliverables:**
- GKE cluster running
- All services deployed
- Cloud SQL configured
- Redis configured
- SSL certificates active
- Full deployment tested

---

## 5. Migration Strategy

### 5.1 Phased Migration Approach

**Phase 1: Preparation (Week 1-2)**
- Set up new microservices structure
- Create databases
- Set up development environment

**Phase 2: User Service Migration (Week 3-7)**
- Extract user management functionality
- Migrate user data
- Test user service independently
- Update frontend to use new endpoints

**Phase 3: Match Service Migration (Week 8-10)**
- Extract match/game functionality
- Migrate match data
- Test match service independently
- Update frontend WebSocket connections

**Phase 4: API Gateway Integration (Week 11-12)**
- Set up API Gateway
- Configure routing
- Integrate JWT validation
- Test end-to-end flow

**Phase 5: Deployment (Week 13-15)**
- Dockerize all services
- Deploy to Kubernetes
- Configure production environment
- Monitor and optimize

### 5.2 Data Migration Plan

**User Service Data Migration:**
1. Export user data from monolithic database
2. Transform data to new schema
3. Import into user_service_db
4. Verify data integrity
5. Update user IDs in match service (if needed)

**Match Service Data Migration:**
1. Export match data from monolithic database
2. Transform data to new schema
3. Import into match_service_db
4. Verify data integrity
5. Update references to user IDs

**Migration Script Example:**
```sql
-- Export from monolith
SELECT * FROM users INTO OUTFILE '/tmp/users.csv';

-- Import to user service
LOAD DATA INFILE '/tmp/users.csv' 
INTO TABLE users 
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"';
```

### 5.3 Rollback Strategy

**If Migration Fails:**
1. Keep monolithic application running in parallel
2. Route traffic back to monolith
3. Fix issues in microservices
4. Retry migration after fixes

**Rollback Steps:**
- Update API Gateway routes to point to monolith
- Or disable API Gateway and use monolith directly
- Keep microservices running for testing
- Fix issues and retry

---

## 6. Technology Stack Summary

### 6.1 Backend Services

| Service | Framework | Port | Database | Key Dependencies |
|---------|-----------|------|----------|------------------|
| User Service | Spring Boot 4.0.1 | 8081 | MySQL 8.0 | Security, JPA, OAuth2, JWT |
| Match Service | Spring Boot 4.0.1 | 8082 | MySQL 8.0 | WebSocket, JPA, OpenFeign |
| API Gateway | Spring Cloud Gateway | 8080 | N/A | Gateway, Security, Discovery |
| Config Service | Spring Cloud Config | 8888 | Git | Config Server |

### 6.2 Infrastructure

- **Containerization**: Docker
- **Orchestration**: Kubernetes (GKE)
- **Database**: Cloud SQL (MySQL)
- **Caching**: Memorystore (Redis)
- **Message Broker**: RabbitMQ/Kafka (Optional)
- **Service Discovery**: Kubernetes native
- **Load Balancing**: GKE Ingress
- **SSL/TLS**: Google Managed Certificates

### 6.3 Development Tools

- **Build Tool**: Maven
- **Version Control**: Git
- **CI/CD**: GitHub Actions / Cloud Build
- **Monitoring**: Cloud Monitoring, Prometheus
- **Logging**: Cloud Logging, ELK Stack (Optional)
- **Testing**: JUnit, Mockito, TestContainers

---

## 7. API Endpoints Summary

### 7.1 User Service Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/logout` | User logout | Yes |
| POST | `/api/auth/refresh` | Refresh JWT token | Yes |
| GET | `/api/users/profile` | Get current user profile | Yes |
| PUT | `/api/users/profile` | Update profile | Yes |
| GET | `/api/users/{id}` | Get user by ID | Yes |
| GET | `/api/users` | List users (admin) | Yes (Admin) |

### 7.2 Match Service Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/matches/create` | Create new match | Yes |
| POST | `/api/matches/{id}/move` | Make a move | Yes |
| GET | `/api/matches/{id}` | Get match details | Yes |
| GET | `/api/matches/{id}/history` | Get move history | Yes |
| GET | `/api/matches/user/{userId}` | Get user's matches | Yes |
| POST | `/api/matches/{id}/resign` | Resign match | Yes |
| POST | `/api/matches/{id}/draw` | Offer/accept draw | Yes |
| POST | `/api/matchmaking/join` | Join matchmaking queue | Yes |
| POST | `/api/matchmaking/leave` | Leave queue | Yes |
| GET | `/api/matches/stats/{userId}` | User match statistics | Yes |

### 7.3 WebSocket Endpoints

| Endpoint | Description | Auth Required |
|----------|-------------|---------------|
| `/ws-indichess` | WebSocket connection endpoint | Yes |
| `/app/game/{matchId}/move` | Send move | Yes |
| `/app/game/{matchId}/resign` | Resign game | Yes |
| `/app/game/{matchId}/draw` | Offer draw | Yes |
| `/topic/game/{matchId}` | Receive game updates | Yes |

---

## 8. Database Schema Summary

### 8.1 User Service Database

**Tables:**
- `users`: User accounts
- `roles`: User roles (USER, ADMIN)
- `user_roles`: User-role mapping
- `user_sessions`: Active sessions/token blacklist
- `permissions`: Role permissions (optional)

### 8.2 Match Service Database

**Tables:**
- `matches`: Chess matches
- `moves`: Move history
- `ratings`: User ratings per game type
- `match_queue`: Matchmaking queue

---

## 9. Security Considerations

### 9.1 Authentication & Authorization

- **JWT Tokens**: Stateless authentication
- **Token Expiration**: Configurable TTL
- **Token Blacklist**: For logout functionality
- **OAuth2**: Google/GitHub integration
- **Role-Based Access Control**: USER, ADMIN roles

### 9.2 Network Security

- **HTTPS/TLS**: All external communication encrypted
- **Service-to-Service**: Internal network communication
- **CORS**: Configured for frontend origin only
- **Rate Limiting**: Prevent abuse

### 9.3 Data Security

- **Password Encryption**: BCrypt hashing
- **Secrets Management**: Kubernetes Secrets
- **Database Encryption**: At rest and in transit
- **Input Validation**: All user inputs validated

---

## 10. Monitoring & Observability

### 10.1 Logging

- **Centralized Logging**: Cloud Logging / ELK Stack
- **Structured Logging**: JSON format
- **Log Levels**: DEBUG, INFO, WARN, ERROR
- **Request Tracing**: Correlation IDs

### 10.2 Metrics

- **Application Metrics**: Micrometer
- **Custom Metrics**: Business-specific metrics
- **Infrastructure Metrics**: CPU, Memory, Network
- **Database Metrics**: Query performance, connection pool

### 10.3 Health Checks

- **Liveness Probe**: Service is running
- **Readiness Probe**: Service is ready to accept traffic
- **Health Endpoints**: `/actuator/health`

### 10.4 Alerting

- **Service Down**: Alert when service unavailable
- **High Error Rate**: Alert on error threshold
- **High Latency**: Alert on response time threshold
- **Resource Exhaustion**: Alert on CPU/Memory limits

---

## 11. Testing Strategy

### 11.1 Unit Testing

- **Service Layer**: Test business logic
- **Repository Layer**: Test data access
- **Utility Classes**: Test helper functions
- **Target Coverage**: 80%+ code coverage

### 11.2 Integration Testing

- **API Testing**: Test REST endpoints
- **Database Testing**: Test with test database
- **Service Integration**: Test service-to-service calls
- **WebSocket Testing**: Test real-time functionality

### 11.3 End-to-End Testing

- **Full User Flows**: Complete user journeys
- **Multi-Service**: Test across services
- **Performance Testing**: Load and stress testing
- **Security Testing**: Penetration testing

### 11.4 Test Tools

- **JUnit 5**: Unit and integration tests
- **Mockito**: Mocking framework
- **TestContainers**: Database testing
- **Postman/Newman**: API testing
- **JMeter/Gatling**: Load testing

---

## 12. CI/CD Pipeline

### 12.1 Continuous Integration

**Pipeline Stages:**
1. **Code Checkout**: Clone repository
2. **Build**: Maven build
3. **Unit Tests**: Run unit tests
4. **Integration Tests**: Run integration tests
5. **Code Quality**: SonarQube analysis
6. **Build Docker Images**: Create container images
7. **Push to Registry**: Push to GCR/Artifact Registry

**GitHub Actions Example:**
```yaml
name: CI Pipeline
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
      - name: Build Backend with Maven
        run: cd backend && mvn clean install
      - name: Run Backend Tests
        run: cd backend && mvn test
      - name: Build Backend Docker Images
        run: |
          docker build -t user-service:${{ github.sha }} ./backend/user-service
          docker build -t match-service:${{ github.sha }} ./backend/match-service
          docker build -t api-gateway:${{ github.sha }} ./backend/api-gateway
      - name: Build Frontend
        run: cd frontend && npm install && npm run build
      - name: Build Frontend Docker Image
        run: docker build -t frontend:${{ github.sha }} ./frontend
```

### 12.2 Continuous Deployment

**Deployment Stages:**
1. **Build Production Images**: Tag with version
2. **Security Scan**: Scan images for vulnerabilities
3. **Deploy to Staging**: Deploy to staging environment
4. **Run E2E Tests**: Execute end-to-end tests
5. **Deploy to Production**: Deploy to production (manual approval)
6. **Health Check**: Verify deployment health
7. **Rollback**: Automatic rollback on failure

---

## 13. Performance Optimization

### 13.1 Database Optimization

- **Indexing**: Add indexes on frequently queried columns
- **Query Optimization**: Optimize slow queries
- **Connection Pooling**: Configure connection pools
- **Caching**: Cache frequently accessed data

### 13.2 Application Optimization

- **Async Processing**: Use async for non-blocking operations
- **Connection Pooling**: Optimize database connections
- **Caching**: Redis for session and data caching
- **Load Balancing**: Distribute load across instances

### 13.3 Infrastructure Optimization

- **Auto-scaling**: Scale based on CPU/Memory
- **Resource Limits**: Set appropriate resource limits
- **CDN**: Use CDN for static assets (if applicable)
- **Database Replication**: Read replicas for scaling

---

## 14. Risk Assessment & Mitigation

### 14.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Service failures | High | Medium | Circuit breakers, health checks, monitoring |
| Database failures | High | Low | Backups, replication, failover |
| Network issues | Medium | Medium | Retry logic, timeouts, circuit breakers |
| Data inconsistency | High | Medium | Eventual consistency, data validation |
| Performance degradation | Medium | Medium | Load testing, auto-scaling, caching |

### 14.2 Migration Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data loss during migration | High | Low | Backup before migration, verify data integrity |
| Service downtime | High | Medium | Phased migration, parallel running |
| Integration issues | Medium | Medium | Thorough testing, gradual rollout |
| Performance issues | Medium | Medium | Load testing, optimization |

---

## 15. Success Criteria

### 15.1 Functional Requirements

- ✅ All existing features working in microservices
- ✅ User authentication and authorization
- ✅ Match creation and gameplay
- ✅ Real-time WebSocket functionality
- ✅ Rating system
- ✅ Match history

### 15.2 Non-Functional Requirements

- ✅ Response time < 200ms for API calls
- ✅ WebSocket latency < 100ms
- ✅ 99.9% uptime
- ✅ Support 1000+ concurrent users
- ✅ Horizontal scalability
- ✅ Zero-downtime deployments

### 15.3 Quality Metrics

- ✅ 80%+ test coverage
- ✅ All integration tests passing
- ✅ No critical security vulnerabilities
- ✅ Code quality score > 8.0 (SonarQube)

---

## 16. Timeline Summary

| Week | Phase | Key Deliverables |
|------|-------|------------------|
| 1-2 | Setup | Project structure, parent POM, service initialization |
| 3 | Config Service | Config Service setup (optional) |
| 4 | Database Setup | Database schemas, migrations |
| 5-7 | User Service | Authentication, authorization, user management |
| 8-10 | Match Service | Game logic, matchmaking, WebSocket |
| 11-12 | API Gateway | Routing, load balancing, security |
| 13 | Integration | Service communication, E2E testing |
| 14-15 | Deployment | Docker, Kubernetes, GKE deployment |

**Total Duration**: 15 weeks (~3.5 months)

---

## 17. Next Steps & Future Enhancements

### 17.1 Immediate Next Steps

1. Review and approve this plan
2. Set up development environment
3. Create GitHub repository structure
4. Initialize services from Spring Initializr
5. Begin Week 1-2 tasks

### 17.2 Future Enhancements (Post-MVP)

- **Analytics Service**: Game analytics, user behavior tracking
- **Notification Service**: Push notifications, email notifications
- **Chat Service**: In-game chat functionality
- **Tournament Service**: Tournament management
- **AI Service**: Chess engine integration
- **Replay Service**: Game replay functionality
- **Social Service**: Friends, messaging, social features

---

## 18. Conclusion

This comprehensive plan outlines the migration of the IndiChess monolithic application to a microservices architecture. The plan includes:

- **Detailed analysis** of the current codebase
- **Complete project structure** for microservices
- **Week-by-week implementation plan** with specific tasks
- **Technology stack** and dependencies
- **Database schemas** and migration strategies
- **Security considerations** and best practices
- **Deployment strategy** for Kubernetes/GKE
- **Testing and monitoring** approaches

The migration will be executed in phases, ensuring minimal disruption and maintaining system stability throughout the process. Each phase includes specific deliverables and success criteria to track progress.

**Key Benefits of Microservices Architecture:**
- **Scalability**: Scale services independently
- **Maintainability**: Easier to maintain and update
- **Technology Flexibility**: Use different technologies per service
- **Fault Isolation**: Failures in one service don't affect others
- **Team Autonomy**: Teams can work independently on services

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Author**: Development Team  
**Status**: Ready for Implementation