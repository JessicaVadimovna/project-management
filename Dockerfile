# Этап сборки
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем файлы зависимостей
COPY package.json package-lock.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь код
COPY . .

# Собираем приложение
RUN npm run build

# Этап продакшена
FROM node:18-alpine

WORKDIR /app

# Устанавливаем сервер для обслуживания статики
RUN npm install -g serve

# Копируем собранные файлы
COPY --from=builder /app/dist ./dist

# Экспонируем порт
EXPOSE 3000

# Запускаем сервер
CMD ["serve", "-s", "dist", "-l", "3000"]