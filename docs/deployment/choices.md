# Выбор опций деплоя и CI/CD (Short Track → Yandex Cloud)

Документ фиксирует выбранные варианты по каждому компоненту. Используется при настройке Terraform и CI/CD.

Ссылка на план: [Yandex Cloud Deploy and CI/CD](../../.cursor/plans/) (план деплоя в Yandex Cloud).

---

## Таблица решений

| Компонент | Вариант A | Вариант B | Вариант C | Выбор |
|-----------|-----------|-----------|-----------|--------|
| **Хостинг NextJS (web + API)** | Serverless Containers (YC Serverless) | Compute Cloud: VM + Docker | Managed Service for Kubernetes (K8s) | |
| **Хостинг BullMQ worker** | Compute Cloud: одна VM, Docker | Serverless Containers (короткие задачи) | K8s (Deployment) | |
| **Redis** | Managed Service for Redis | Self-hosted Redis на VM воркера | — | |
| **БД (мониторы, пользователи, push)** | YDB (Document API) | Managed Service for MongoDB | PostgreSQL (Managed) + документная схема | |
| **Секреты** | Lockbox (Secret Manager) | Переменные окружения в CI (не для prod) | — | |
| **Система CI/CD** | GitHub Actions | GitLab CI | Yandex Cloud CI | |
| **Окружения** | Staging + Production | Только Production | Staging + Prod + Preview (per-PR) | |

Укажите в колонке «Выбор» букву (A, B, C) или краткое название варианта.

---

## Рекомендуемый набор (по умолчанию)

- **NextJS**: A (Serverless Containers) — проще и дешевле для старта.
- **Worker**: A (Compute Cloud VM) — воркер долгоживущий, VM предсказуема.
- **Redis**: A (Managed Service for Redis) — отказоустойчивость и бэкапы.
- **БД**: A (YDB Document API) или B (MongoDB) — документная модель как в плане приложения.
- **Секреты**: A (Lockbox).
- **CI/CD**: по репозиторию — GitHub Actions или GitLab CI.
- **Окружения**: Staging + Production.

---

## Дополнительные решения (опционально)

| Вопрос | Вариант A | Вариант B | Выбор |
|--------|-----------|-----------|--------|
| **Триггер деплоя в prod** | Только по тегу (например `v*`) | Тег + ручной запуск (workflow_dispatch) | |
| **Сборка образов** | В CI (GitHub Actions / GitLab) | В Yandex Container Registry (триггер из CI) | |
| **Terraform state** | Yandex Object Storage + блокировка | Локальный state (только для dev) | |
| **Код Terraform** | В этом репозитории (`shortack/terraform/`) | Отдельный репозиторий (например `shortack-infra`) | |

---

## История изменений

- *(дата)* — первоначальная таблица вариантов.
