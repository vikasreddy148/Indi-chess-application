# IndiChess Kubernetes Deployment

## Prerequisites

- Kubernetes cluster (minikube, kind, or GKE)
- kubectl configured
- Docker images built and pushed to your registry

## Build and Push Images

```bash
# Build backend services (from project root)
cd backend && mvn clean package -DskipTests

docker build -t indichess/user-service:1.0.0 -f user-service/Dockerfile .
docker build -t indichess/match-service:1.0.0 -f match-service/Dockerfile .
docker build -t indichess/api-gateway:1.0.0 -f api-gateway/Dockerfile .

# Build frontend
cd ../frontend && npm run build
docker build -t indichess/frontend:1.0.0 .

# For minikube/kind, load images:
minikube image load indichess/user-service:1.0.0
minikube image load indichess/match-service:1.0.0
minikube image load indichess/api-gateway:1.0.0
minikube image load indichess/frontend:1.0.0
```

## Deploy Databases (for local cluster)

For local development, deploy MySQL and Redis. For production, use Cloud SQL and Memorystore.

```bash
# Optional: Deploy MySQL and Redis (adjust secrets with your DB URLs)
kubectl apply -f infrastructure/
```

## Deploy Application

```bash
# 1. Create namespace
kubectl apply -f namespace.yaml

# 2. Deploy secrets and configmaps (creates secrets needed by infrastructure)
kubectl apply -f backend/user-service/
kubectl apply -f backend/match-service/
kubectl apply -f backend/api-gateway/

# 3. Deploy databases and Redis (for local dev)
kubectl apply -f infrastructure/

# 4. Wait for databases to be ready, then deploy frontend
kubectl apply -f frontend/

# 5. Optional: Deploy ingress (requires nginx ingress controller)
kubectl apply -f backend/api-gateway/ingress.yaml
```

Note: Backend deployments will retry until MySQL is ready. For production, use external databases (Cloud SQL, etc.) and update the secrets.

## Update Secrets

Before deploying, update the secrets with your production values:

- `JWT_SECRET`: Same across user-service, match-service, api-gateway
- `SPRING_DATASOURCE_*`: Database connection details
- Use external secret management (e.g., Sealed Secrets, External Secrets) in production

## Verify

```bash
kubectl get pods -n indichess
kubectl get services -n indichess
kubectl get ingress -n indichess
```
