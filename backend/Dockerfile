# Build stage
FROM golang:1.23.1-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git gcc musl-dev

WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
ENV CGO_ENABLED=1
RUN go build -o main .

# Final stage
FROM alpine:3.14

# Install runtime dependencies
RUN apk add --no-cache postgresql-client

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/main .

# Copy data directory
COPY data ./data

# Create script to wait for database and start application
COPY <<EOF /app/start.sh
#!/bin/sh

echo "Waiting for database..."
until pg_isready -h db -p 5432 -U postgres; do
  echo "Database is unavailable - sleeping"
  sleep 1
done

echo "Database is up - starting application"
exec /app/main
EOF

RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]
