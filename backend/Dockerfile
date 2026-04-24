# Build stage
FROM maven:3.8.5-eclipse-temurin-17 AS build
RUN apt-get update && apt-get install -y unzip && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
# Copy model separately to leverage layer caching in build stage if needed for tests
# However, the model is usually used at runtime.
RUN mvn clean package -DskipTests

# Reliable extraction or download of libvosk.so based on architecture
RUN mkdir -p /app/libs && \
    VOSK_VERSION=0.3.45 && \
    ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then \
        mvn dependency:copy -Dartifact=com.alphacephei:vosk:${VOSK_VERSION}:jar -DoutputDirectory=/app/libs && \
        unzip -j /app/libs/vosk-${VOSK_VERSION}.jar "linux-x86-64/libvosk.so" -d /app/libs/; \
    elif [ "$ARCH" = "aarch64" ]; then \
        apt-get update && apt-get install -y wget && \
        wget https://github.com/alphacep/vosk-api/releases/download/v${VOSK_VERSION}/vosk-linux-aarch64-${VOSK_VERSION}.zip && \
        unzip vosk-linux-aarch64-${VOSK_VERSION}.zip "vosk-linux-aarch64-${VOSK_VERSION}/libvosk.so" -d /app/libs/ && \
        mv /app/libs/vosk-linux-aarch64-${VOSK_VERSION}/libvosk.so /app/libs/ && \
        rm -rf vosk-linux-aarch64-${VOSK_VERSION}.zip; \
    else \
        echo "Unsupported architecture: $ARCH" && exit 1; \
    fi

# Run stage
FROM eclipse-temurin:17-jre-jammy
RUN apt-get update && apt-get install -y libatomic1 unzip && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/target/vocab-0.0.1-SNAPSHOT.jar app.jar
COPY --from=build /app/libs/libvosk.so /usr/lib/libvosk.so

# serviceAccountKey.json is now provided via environment variable FIREBASE_KEY_JSON
# Copy model separately to leverage layer caching
# This is the 68MB folder. Placing it here ensures it's only copied once and cached.
COPY src/main/resources/model ./model

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

