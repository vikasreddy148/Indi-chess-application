# Quick Start Guide

## Prerequisites Check

Before running the application, ensure you have:
- ✅ Java 17 installed
- ✅ Maven installed
- ✅ MySQL 8.0+ OR Docker Desktop running

## Option 1: Using Docker (Recommended)

### Step 1: Start Docker Desktop
Make sure Docker Desktop is running on your Mac.

### Step 2: Start Databases
```bash
cd /Users/vikasreddy/Indi-chess-application
docker-compose up -d user-db match-db redis
```

Wait 10-15 seconds for databases to initialize.

### Step 3: Verify Databases are Running
```bash
docker ps
```

You should see:
- `indichess-user-db`
- `indichess-match-db`
- `indichess-redis`

### Step 4: Run User Service
```bash
cd backend/user-service
mvn spring-boot:run
```

## Option 2: Using Local MySQL

### Step 1: Start MySQL
```bash
# If installed via Homebrew
brew services start mysql

# Or manually
mysql.server start
```

### Step 2: Create Databases
```bash
mysql -u root -p
```

Then run:
```sql
CREATE DATABASE user_service_db;
CREATE DATABASE match_service_db;
EXIT;
```

### Step 3: Update Configuration
Edit `backend/user-service/src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/user_service_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
```

### Step 4: Run User Service
```bash
cd backend/user-service
mvn spring-boot:run
```

## Troubleshooting

### "Connection refused" Error
- **Docker**: Make sure Docker Desktop is running and containers are up
- **Local MySQL**: Check if MySQL is running: `brew services list` or `mysql.server status`

### Port Already in Use
- User Service uses port 8081
- Match Service uses port 8082
- API Gateway uses port 8080
- Stop any services using these ports

### Database Connection Issues
- Verify MySQL is listening on the correct port (3306 for local, 3307 for Docker)
- Check credentials in `application.yml`
- Ensure database exists

## Testing the Application

Once User Service is running:

1. **Register a user:**
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "country": "India"
  }'
```

2. **Login:**
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "usernameOrEmail": "testuser",
    "password": "password123"
  }'
```

## Next Steps

After User Service is running:
1. Start Match Service (port 8082)
2. Start API Gateway (port 8080)
3. Start Frontend (port 3000 or 5173)
