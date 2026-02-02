# IndiChess - Microservices Chess Application

A full-stack, real-time multiplayer chess platform built with microservices architecture.

## 🏗️ Architecture

This application follows a microservices architecture with the following services:

- **User Service** (Port 8081): Authentication, authorization, and user management
- **Match Service** (Port 8082): Game logic, matchmaking, and real-time gameplay via WebSocket
- **API Gateway** (Port 8080): Request routing, load balancing, and JWT validation
- **Config Service** (Port 8888): Centralized configuration management (Optional)
- **Frontend**: React application with Vite

## 📁 Project Structure

```
Indi-chess-application/
├── backend/              # All backend microservices
│   ├── user-service/
│   ├── match-service/
│   ├── api-gateway/
│   ├── config-service/
│   └── shared-lib/
├── frontend/            # React frontend application
├── plans/               # Documentation and implementation plans
└── k8s/                 # Kubernetes deployment manifests
```

## 🚀 Quick Start

### Prerequisites

- Java 17 or higher
- Node.js 18+ (v20 recommended)
- Docker and Docker Compose
- Maven 3.8+

### Local Development with Docker Compose

1. Clone the repository:
```bash
git clone <repository-url>
cd Indi-chess-application
```

2. Start all services:
```bash
docker-compose up --build
```

3. Access the application:
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8080
- User Service: http://localhost:8081
- Match Service: http://localhost:8082

### Manual Development Setup

#### Backend Services

1. Navigate to backend directory:
```bash
cd backend
```

2. Build all services:
```bash
mvn clean install
```

3. Run individual services:
```bash
# User Service
cd user-service
mvn spring-boot:run

# Match Service
cd match-service
mvn spring-boot:run

# API Gateway
cd api-gateway
mvn spring-boot:run
```

#### Frontend

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

## 🛠️ Technology Stack

### Backend
- Spring Boot 4.0.1
- Spring Cloud Gateway
- Spring Security with JWT
- Spring WebSocket (STOMP)
- MySQL 8.0
- Redis (for session management)
- Maven

### Frontend
- React 19
- Vite 6
- Tailwind CSS 4
- SockJS & StompJS for WebSocket

### Infrastructure
- Docker & Docker Compose
- Kubernetes (GKE)
- MySQL (Cloud SQL)
- Redis (Memorystore)

## 📋 Development Plan

See [plans/micrservices-implementation-plan.md](./plans/micrservices-implementation-plan.md) for detailed implementation plan.

## 🔧 Configuration

### Environment Variables

Backend services use environment variables for configuration. See individual service `application.yml` files for details.

Key variables:
- `SPRING_DATASOURCE_URL`: Database connection URL
- `JWT_SECRET`: JWT signing secret
- `GOOGLE_OAUTH_CLIENT_ID`: OAuth2 client ID
- `GOOGLE_OAUTH_CLIENT_SECRET`: OAuth2 client secret

## 🧪 Testing

```bash
# Run all backend tests
cd backend
mvn test

# Run frontend tests
cd frontend
npm test
```

## 📦 Building for Production

```bash
# Build backend services
cd backend
mvn clean package -DskipTests

# Build frontend
cd frontend
npm run build
```

## 🚢 Deployment

See Kubernetes manifests in `k8s/` directory for deployment configuration.

## 📝 License

MIT License

## 👤 Author

Vikas Reddy
