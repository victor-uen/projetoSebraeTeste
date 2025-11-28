# Estágio de build com Java 21
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copiar pom.xml e baixar dependências (cache layer)
COPY pom.xml .
RUN mvn dependency:go-offline

# Copiar código fonte e compilar
COPY src ./src
RUN mvn clean package -DskipTests

RUN echo "=== Conteúdo do diretório target/ ===" && ls -lah /app/target/

# Estágio de produção com Java 21
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copiar JAR compilado do estágio anterior
COPY --from=build /app/target/*.jar app.jar

# Expor porta padrão do Spring Boot
EXPOSE 8080

# Executar aplicação
ENTRYPOINT ["java", "-jar", "app.jar"]
