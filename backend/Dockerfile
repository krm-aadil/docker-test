FROM golang:1.22-alpine
WORKDIR /app

# Copy your code into the container
COPY go.mod ./
COPY main.go .

# Automatically find and download the PostgreSQL driver
RUN go mod tidy

# Run the app
CMD ["go", "run", "main.go"]