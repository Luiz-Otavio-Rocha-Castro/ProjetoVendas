FROM eclipse-temurin:25-jdk AS build
WORKDIR /app

# Copia os arquivos do Maven Wrapper e o pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Dá permissão de execução ao mvnw e baixa as dependências (ajuda no cache do Docker)
RUN chmod +x ./mvnw
RUN ./mvnw dependency:go-offline

# Copia o código-fonte e compila
COPY src src
RUN ./mvnw clean package -DskipTests

# Estágio de Execução
FROM eclipse-temurin:25-jre
WORKDIR /app

# Copia o .jar gerado no estágio anterior
COPY --from=build /app/target/*.jar app.jar

# Expõe a porta 8080
EXPOSE 8080

# Comando para iniciar a aplicação
ENTRYPOINT ["java", "-jar", "app.jar"]
