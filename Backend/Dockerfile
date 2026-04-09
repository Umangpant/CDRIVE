FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml ./
RUN mvn -q -DskipTests dependency:go-offline

COPY src src
RUN mvn -q -DskipTests package && \
    jar_path="$(find target -maxdepth 1 -type f -name '*.jar' ! -name '*.jar.original' | head -n 1)" && \
    test -n "$jar_path" && \
    cp "$jar_path" target/app.jar

FROM eclipse-temurin:21-jre
WORKDIR /app

# FIXED: Run as non-root user for security
RUN addgroup --system appgroup && adduser --system appuser --ingroup appgroup

COPY --from=build /app/target/app.jar app.jar

# Give ownership of the jar to the non-root user
RUN chown appuser:appgroup app.jar

USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]