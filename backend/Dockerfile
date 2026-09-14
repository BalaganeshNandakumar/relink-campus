# Stage 1: Build the Spring Boot application using Maven + JDK 21
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copy Maven wrapper and POM file first to leverage Docker layer caching
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Make Maven wrapper executable
RUN chmod +x mvnw

# Download dependencies (offline cache layer)
RUN ./mvnw dependency:go-offline -B || true

# Copy source code
COPY src/ src/

# Build and package the application skipping tests
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Create a lightweight runtime image using JRE 21
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create a non-root user for enhanced container security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy the repackaged Spring Boot executable JAR from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Change ownership of the app directory to the non-root user
RUN chown -R appuser:appgroup /app

# Switch to the non-root user
USER appuser

# Expose default port (Render will dynamically supply $PORT at runtime)
EXPOSE 8081

# Launch the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
