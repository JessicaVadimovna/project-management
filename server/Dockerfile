# Этап сборки
FROM golang:1.24.1-alpine AS builder

# Установка необходимых инструментов и зависимостей для SQLite
RUN apk add --no-cache git gcc musl-dev sqlite-dev

# Установка рабочей директории
WORKDIR /app

# Копируем файлы зависимостей
COPY go.mod go.sum ./

# Загружаем зависимости
RUN go mod download

# Копируем весь код
COPY . .

# Компилируем приложение
RUN CGO_ENABLED=1 GOOS=linux go build -o main ./cmd/service

# Проверяем, создан ли бинарник
RUN ls -l /app/main || echo "Error: main binary not created"

# Финальный образ
FROM alpine:latest

# Установка SQLite
RUN apk add --no-cache sqlite

WORKDIR /app

# Копируем скомпилированный бинарник
COPY --from=builder /app/main .

# Даем права на выполнение
RUN chmod +x ./main

# Проверяем наличие бинарника в финальном образе
RUN ls -l /app/main

# Экспонируем порт
EXPOSE 8080

# Запускаем приложение
CMD ["./main"]