# SMILESHOP - Интернет-магазин ключей для видеоигр

## 📋 Описание проекта

SMILESHOP - это современный интернет-магазин для продажи цифровых ключей к видеоиграм различных платформ (Steam, Xbox, PlayStation). Проект создан с использованием современных веб-технологий и предназначен для изучения и практического применения full-stack разработки.

## 🚀 Технологический стек

### Frontend
- **Next.js** - React фреймворк для SSR/SSG
- **React** - Библиотека для создания пользовательских интерфейсов
- **Ant Design** - UI библиотека компонентов
- **React Context API** - Управление состоянием приложения

### Backend
- **Next.js API Routes** - Серверные API эндпоинты
- **Prisma ORM** - Объектно-реляционное отображение
- **SQLite** - Локальная база данных (для разработки)
- **NextAuth.js** - Система аутентификации

### Дополнительные инструменты
- **YooKassa API** - Интеграция платежной системы
- **Nodemailer** - Отправка email уведомлений
- **bcrypt** - Хеширование паролей
- **csv-stringify** - Экспорт данных в CSV
- **Zod** - Валидация данных

## 🏗️ Архитектура проекта

```
smileshop/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── pages/
│   ├── api/
│   │   ├── auth/
│   │   ├── payment/
│   │   └── export-orders/
│   ├── _app.js
│   └── index.js
├── components/
│   ├── Header.js
│   ├── GameCard.js
│   ├── GameCardModal.js
│   ├── LoginModal.js
│   └── Footer.js
├── contexts/
│   └── AppContext.js
├── styles/
│   └── globals.css
└── README.md
```

## 📦 Установка и запуск

### Требования
- Node.js (версия 16 или выше)
- npm или yarn

### Пошаговая установка

1. **Клонируйте репозиторий**
   ```bash
   git clone <repository-url>
   cd smileshop
   ```

2. **Установите зависимости**
   ```bash
   npm install
   # или
   yarn install
   ```

3. **Настройте базу данных**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Создайте файл окружения**
   ```bash
   cp .env.example .env.local
   ```
   Заполните необходимые переменные окружения:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   YOOKASSA_SHOP_ID="your-shop-id"
   YOOKASSA_SECRET_KEY="your-secret-key"
   EMAIL_SERVER_HOST="smtp.gmail.com"
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER="your-email@gmail.com"
   EMAIL_SERVER_PASSWORD="your-password"
   ```

5. **Запустите приложение в режиме разработки**
   ```bash
   npm run dev
   # или
   yarn dev
   ```

6. **Откройте браузер**
   Перейдите по адресу `http://localhost:3000`

## 🗄️ Структура базы данных

### Модель Game
- `id` - Уникальный идентификатор
- `title` - Название игры
- `description` - Описание игры
- `price` - Цена
- `imageUrl` - Ссылка на изображение
- `platform` - Платформа (STEAM/XBOX/PS)
- `keys` - Массив доступных ключей

### Модель User
- `id` - Уникальный идентификатор
- `email` - Email пользователя
- `password` - Хешированный пароль
- `isAdmin` - Флаг администратора

### Модель Order
- `id` - Уникальный идентификатор
- `userId` - ID пользователя
- `gameId` - ID игры
- `key` - Купленный ключ
- `price` - Цена покупки
- `purchaseDate` - Дата покупки

## 🎯 Основные функции

### Для пользователей
- 🎮 Просмотр каталога игр с фильтрацией по платформам
- 🛒 Покупка цифровых ключей
- 💳 Оплата через YooKassa
- 📧 Автоматическая отправка ключей на email
- 🔐 Регистрация и авторизация

### Для администраторов
- ➕ Добавление новых игр
- ✏️ Редактирование существующих игр
- 🗑️ Удаление игр
- 📊 Экспорт данных о заказах в CSV
- 🔒 Двухфакторная аутентификация

## 🔧 API Endpoints

### Аутентификация
- `POST /api/auth/signin` - Вход в систему
- `POST /api/auth/signout` - Выход из системы
- `POST /api/auth/signup` - Регистрация

### Игры
- `GET /api/games` - Получение списка игр
- `POST /api/games` - Создание новой игры (админы)
- `PUT /api/games/[id]` - Обновление игры (админы)
- `DELETE /api/games/[id]` - Удаление игры (админы)

### Платежи
- `POST /api/payment` - Создание платежа
- `POST /api/payment/webhook` - Обработка webhook от YooKassa

### Экспорт данных
- `GET /api/export-orders` - Экспорт заказов в CSV (админы)

## 🔒 Безопасность

- **Хеширование паролей** с использованием bcrypt
- **Валидация данных** с помощью Zod
- **Защита от SQL-инъекций** через Prisma ORM
- **Rate limiting** для API endpoints
- **HTTPS** в продакшене
- **Двухфакторная аутентификация** для администраторов

## 🚀 Развертывание

### Vercel (рекомендуется)
1. Подключите репозиторий к Vercel
2. Настройте переменные окружения
3. Разверните проект

### Другие платформы
Проект совместим с любыми платформами, поддерживающими Next.js:
- Netlify
- Railway
- Heroku

## 📝 Скрипты

```bash
# Разработка
npm run dev

# Сборка для продакшена
npm run build

# Запуск продакшен версии
npm run start

# Линтинг
npm run lint

# База данных
npx prisma studio      # GUI для базы данных
npx prisma migrate dev  # Применение миграций
npx prisma generate     # Генерация клиента
```

## 🧪 Тестирование

### Тестовые данные
После установки автоматически создаются:
- Тестовые игры для всех платформ
- Админский аккаунт: `admin@example.com` / `password123`
- Пользовательский аккаунт: `user@example.com` / `password123`

### YooKassa тестирование
Используйте тестовые карты:
- Успешная оплата: `5555555555554444`
- Отклоненная оплата: `5555555555554477`

## 🤝 Содействие

1. Форкните проект
2. Создайте ветку для новой функции (`git checkout -b feature/AmazingFeature`)
3. Зафиксируйте изменения (`git commit -m 'Add some AmazingFeature'`)
4. Отправьте в ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License - смотрите файл [LICENSE.md](LICENSE.md) для деталей.

## 📞 Поддержка

Если у вас есть вопросы или проблемы:
- Создайте Issue в GitHub
- Напишите в Telegram: [@smileshop_support](https://t.me/smileshop_support)
- Email: support@smileshop.ru

## 🎯 Планы развития

- [ ] Добавление платформы Nintendo
- [ ] Интеграция с Steam API для автоматического получения информации об играх
- [ ] Система отзывов и рейтингов
- [ ] Программа лояльности и скидки
- [ ] Мобильное приложение
- [ ] Поддержка нескольких языков
- [ ] Интеграция с другими платежными системами

## 📊 Статистика проекта

- **Время разработки для начинающего**: 1-2 недели
- **Линий кода**: ~2000-3000
- **Компонентов React**: 6 основных
- **API endpoints**: 8
- **Поддерживаемые платформы**: Steam, Xbox, PlayStation

---

Создано с ❤️ для изучения современной веб-разработки