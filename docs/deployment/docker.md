# Деплой: сборка образов (Docker)

Как собирать образы NextJS (web) и BullMQ worker и пушить их в Yandex Container Registry.

---

## Требования

- Docker
- Сборка выполняется **из корня репозитория** (монорепо: `apps/web`, `packages/*`).

---

## Образ web (NextJS)

- **Dockerfile:** `apps/web/Dockerfile`
- **Сборка:** из корня репозитория.

```bash
docker build -f apps/web/Dockerfile -t cr.yandex/<REGISTRY_ID>/shortack-web:<TAG> .
```

Пример с тегом по коммиту:

```bash
export TAG=$(git rev-parse --short HEAD)
docker build -f apps/web/Dockerfile -t cr.yandex/<REGISTRY_ID>/shortack-web:$TAG .
```

### Что внутри

- Multi-stage: `deps` (npm ci), `builder` (сборка пакетов + `next build` с `output: "standalone"`), `runner` (только standalone и static).
- В рантере запускается `node server.js` (Next.js standalone).
- Порт по умолчанию: 3000 (переменная `PORT`).

### Локальная проверка

```bash
docker run -p 3000:3000 cr.yandex/<REGISTRY_ID>/shortack-web:latest
# Открыть http://localhost:3000
```

---

## Образ worker (BullMQ)

- **Dockerfile:** `workers/Dockerfile`
- **Сборка:** из корня репозитория.

```bash
docker build -f workers/Dockerfile -t cr.yandex/<REGISTRY_ID>/shortack-worker:<TAG> .
```

### Что внутри

- Multi-stage: deps (npm ci), builder (сборка `@shortack/monitor-core`, `@shortack/queue`), runner с `tsx` и точкой входа `apps/web/workers/monitor-worker.ts`.
- Воркер ожидает переменные окружения: Redis (через `@shortack/queue`), Firebase/Lockbox при необходимости (VAPID, креды и т.д.).

### Локальная проверка

```bash
docker run --env-file .env cr.yandex/<REGISTRY_ID>/shortack-worker:latest
```

---

## Исключения при сборке (.dockerignore)

В корне задан `.dockerignore`, чтобы не копировать в контекст:

- `node_modules`, `.next`, `.git`, `.env*`, `*.log`, `.terraform`, `*.tfstate`, `.cursor`, документацию (кроме нужной).

При необходимости добавьте в `.dockerignore` свои каталоги или файлы.

---

## Пуш в Yandex Container Registry

1. Войти в реестр (OAuth или статический ключ SA):

   ```bash
   # OAuth (токен из консоли или yc)
   echo "<OAUTH_TOKEN>" | docker login --username oauth --password-stdin cr.yandex

   # Или статический ключ сервисного аккаунта (JSON)
   cat key.json | docker login --username json_key --password-stdin cr.yandex
   ```

2. Пуш образов:

   ```bash
   docker push cr.yandex/<REGISTRY_ID>/shortack-web:<TAG>
   docker push cr.yandex/<REGISTRY_ID>/shortack-worker:<TAG>
   ```

`REGISTRY_ID` — ID реестра из вывода Terraform (`terraform output registry_id`) или из консоли Yandex Cloud.

---

## Связь с CI и Terraform

- CI при push в `main` собирает образы с тегом = короткий SHA коммита и пушит в реестр, затем выполняет `terraform apply` с `web_image_tag` и `worker_image_tag`.
- Локальная сборка с тегом `latest` или вручную заданным тегом подходит для проверок и ручного деплоя через Terraform (переменные `web_image_tag`, `worker_image_tag`).

См. также: [CI/CD](ci.md), [Terraform](terraform.md).
