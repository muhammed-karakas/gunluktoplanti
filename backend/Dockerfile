FROM maven:3.8.5-openjdk-17-slim

WORKDIR /app/backend

ARG CORS_FRONTEND_URL

ENV CORS_FRONTEND_URL=$CORS_FRONTEND_URL

COPY . .

RUN mvn clean package -DskipTests && mv target/*.jar /app/back-end.jar && rm -rf /app/backend /root/.m2 /tmp/*

ENTRYPOINT ["java", "-jar", "/app/back-end.jar"]
