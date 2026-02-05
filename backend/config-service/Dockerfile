# -------- BUILD STAGE --------
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml .
COPY config-service/pom.xml config-service/pom.xml
COPY config-service/src config-service/src

RUN mvn -B -f config-service/pom.xml package -DskipTests -q

# -------- RUN STAGE --------
FROM eclipse-temurin:17-jre
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/config-service/target/*.jar app.jar

EXPOSE 8888
ENTRYPOINT ["java", "-jar", "app.jar"]
