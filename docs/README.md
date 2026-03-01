# Документация Shortack

- **[Аутентификация (Auth)](./auth/README.md)** — Auth.js, Telegram (Mini App + Login Widget), OAuth2 (Google), magic link по email: архитектура, сценарии входа, API и конфигурация.

## Деплой в Yandex Cloud

Вся документация по деплою собрана в папке **[deployment/](./deployment/)**:

- **[Обзор](./deployment/README.md)** — порядок настройки, компоненты, быстрый старт.
- **[Выбор опций](./deployment/choices.md)** — таблица решений по хостингу, БД, CI и окружениям.
- **[Настройка Yandex Cloud](./deployment/yandex-cloud-setup.md)** — облако, каталог, биллинг, сервисные аккаунты.
- **[Terraform](./deployment/terraform.md)** — инфраструктура (реестр, VPC, Lockbox, Serverless Container, VM, Redis).
- **[Docker](./deployment/docker.md)** — сборка образов web и worker, пуш в реестр.
- **[Lockbox](./deployment/lockbox.md)** — секреты: payload, привязка к контейнеру и VM.
- **[CI/CD](./deployment/ci.md)** — GitHub Actions, секреты, окружение staging.
