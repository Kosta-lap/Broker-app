# Broker Pet App

Broker Pet App - учебный sandbox для моделирования биржи с двумя интерфейсами:
- админ-панель (React) для управления брокерами, акциями и настройками биржи;
- клиент брокера (Vue) для логина, просмотра портфеля и выполнения сделок.

Сервер (NestJS) отдает REST API и WebSocket-события с тиками рынка.

## Что делает приложение

- Управляет списком брокеров (создание, обновление, удаление).
- Показывает список акций и их историю.
- Запускает/останавливает симуляцию биржи и рассылает обновления по сокету.
- Поддерживает сделки `buy/sell`, пересчет баланса и портфеля брокера.
- Дает сводку для админа по брокерам и их позициям.
- Поддерживает простую авторизацию брокера через cookie.

## Технологии

- Backend: `NestJS`, `TypeScript`, `Socket.IO`, `Passport (local)`, `class-validator`.
- Admin client: `React`, `TypeScript`, `Redux Toolkit`, `Vite`, `Chart.js`.
- Broker client: `Vue 3`, `TypeScript`, `Vue Router`, `Vite`, `vue-chartjs`.
- Инфраструктура: `Docker`, `Docker Compose`.

## Структура проекта

- `server` - backend API + WebSocket.
- `client` - админ-клиент на React.
- `broker-client` - клиент брокера на Vue.
- `docker-compose.yml` - единый dev-запуск всех сервисов.

## Запуск через Docker (рекомендуется)

Требования: установлен и запущен Docker Desktop.

```bash
docker compose up --build
```

Открыть в браузере:
- Админ-клиент: `http://localhost:5173`
- Клиент брокера: `http://localhost:5174`
- API сервер: `http://localhost:3000`

Остановка:

```bash
docker compose down
```

## Локальный запуск без Docker

Нужен `Node.js` 20+ (рекомендуется 22).

1. Backend:
```bash
cd server
npm install
npm run start:dev
```

2. Admin client:
```bash
cd client
npm install
npm run dev
```

3. Broker client:
```bash
cd broker-client
npm install
npm run dev
```

## Тестовые пользователи

Данные лежат в `server/src/data/brokers.json`:
- `Broker One` / пароль `123`
- `Broker Two` / пароль `123`
- `Admin` / пароль `123`
