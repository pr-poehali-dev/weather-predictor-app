# Настройка Telegram-бота для уведомлений

# Шаг 1: Создайте бота через @BotFather

1. Откройте Telegram и найдите [@BotFather](https://t.me/BotFather)
2. Отправьте команду `/newbot`
3. Придумайте имя бота (например: "Волк Синоптик")
4. Придумайте username (например: "volk_sinoptik_bot")
5. **Скопируйте токен** — он понадобится для настройки
6. **Скопируйте username бота** — добавьте его в код:

Откройте файл `src/components/weather/NotificationSettings.tsx` и замените:

```typescript
const TELEGRAM_BOT_USERNAME = 'YOUR_BOT_USERNAME'; // Замените на ваш username
```

На:

```typescript
const TELEGRAM_BOT_USERNAME = 'volk_sinoptik_bot'; // Ваш username без @
```

Пример токена: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`

## Шаг 2: Добавьте токен в секреты

1. В редакторе poehali.dev откройте настройки проекта
2. Перейдите в раздел "Секреты"
3. Добавьте новый секрет:
   - **Имя**: `TELEGRAM_BOT_TOKEN`
   - **Значение**: токен из шага 1

## Шаг 3: Настройте webhook

После деплоя функции `telegram-bot`, вам нужно настроить webhook:

```bash
curl "https://api.telegram.org/bot<ВАШ_ТОКЕН>/setWebhook?url=https://functions.poehali.dev/f03fce2f-ec26-44b9-8491-2ec4d99f6a01"
```

Замените:
- `<ВАШ_ТОКЕН>` — на токен из шага 1
- URL в конце — на URL вашей функции `telegram-bot`

## Шаг 4: Протестируйте бота

1. Найдите вашего бота в Telegram (по username из шага 1)
2. Напишите `/start`
3. Бот должен ответить приветствием и показать ваш Chat ID

## Доступные команды бота

- `/start` — Начало работы, получить Chat ID
- `/subscribe` — Подписаться на уведомления
- `/unsubscribe` — Отписаться от уведомлений
- `/email ваш@email.com` — Добавить email для уведомлений
- `/settings` — Посмотреть текущие настройки
- `/help` — Справка по командам

## Для настройки SMTP (Email уведомления)

Добавьте в секреты проекта:

1. **SMTP_EMAIL** — ваш Gmail адрес (например: `your@gmail.com`)
2. **SMTP_PASSWORD** — пароль приложения Gmail
   - Создайте пароль приложения: https://myaccount.google.com/apppasswords
   - Используйте этот пароль, а не обычный пароль от Gmail

## Проверка работы

1. Напишите боту `/subscribe`
2. Добавьте email командой `/email your@email.com`
3. В веб-интерфейсе нажмите "Тест уведомления"
4. Проверьте, что уведомления пришли в Telegram и на Email

---

**URL функции бота**: https://functions.poehali.dev/f03fce2f-ec26-44b9-8491-2ec4d99f6a01

**Необходимые секреты**:
- ✅ `TELEGRAM_BOT_TOKEN` — токен бота от @BotFather
- ✅ `SMTP_EMAIL` — Gmail адрес для отправки email
- ✅ `SMTP_PASSWORD` — пароль приложения Gmail