# Деплой: CI/CD (GitHub Actions)

Как настроить GitHub Actions для проверок и деплоя в staging (и при необходимости в production).

---

## Обзор

- **При открытии/обновлении PR:** запускаются lint, test (если есть), build. Деплой не выполняется.
- **При push в `main`:** те же шаги, затем сборка образов web и worker, push в Yandex Container Registry (тег = короткий SHA коммита), затем `terraform apply` для staging с обновлёнными тегами образов.

Workflow-файл: [.github/workflows/ci.yml](../../.github/workflows/ci.yml).

---

## Секреты репозитория

В **Settings → Secrets and variables → Actions** создайте секреты:

| Секрет | Описание |
|--------|----------|
| **YC_CLOUD_ID** | ID облака Yandex Cloud |
| **YC_FOLDER_ID_STAGING** | ID каталога для staging |
| **YC_REGISTRY_ID** | ID Container Registry (из `terraform output registry_id` или консоли YC) |
| **YC_OAUTH_TOKEN** | OAuth-токен Yandex: используется для `docker login` в реестр и для Terraform (provider yandex) |

Альтернатива для Terraform: статические ключи сервисного аккаунта. Тогда в workflow должны быть переменные/секреты с ключами (например `YC_ACCESS_KEY`, `YC_SECRET_ACCESS_KEY`), а для входа в реестр — отдельно OAuth или JSON ключ SA.

### Вход в реестр без OAuth (статический ключ SA)

Если используете сервисный аккаунт для CI (например `shortack-ci`):

1. Создайте статический ключ и сохраните JSON в секрет **YC_SA_JSON_KEY**.
2. В workflow замените шаг логина на:
   ```yaml
   - name: Login to Yandex Container Registry
     run: |
       echo "${{ secrets.YC_SA_JSON_KEY }}" | docker login --username json_key --password-stdin cr.yandex
   ```

---

## Окружение staging

В **Settings → Environments** создайте окружение с именем **staging** (как в `environment: staging` в job `deploy-staging`). При необходимости настройте правила защиты или переменные окружения для этого окружения.

---

## Что делает job deploy-staging

1. Определяет тег образа: короткий SHA коммита (`GITHUB_SHA`, первые 7 символов).
2. Логин в Yandex Container Registry (OAuth или json_key).
3. Сборка и push образов:
   - `cr.yandex/<YC_REGISTRY_ID>/shortack-web:<tag>`
   - `cr.yandex/<YC_REGISTRY_ID>/shortack-worker:<tag>`
4. `terraform init` в каталоге `terraform/`.
5. `terraform apply -auto-approve` с:
   - `-var-file=environments/staging/terraform.tfvars`
   - `-var="web_image_tag=<tag>"`
   - `-var="worker_image_tag=<tag>"`

Переменные Terraform (cloud_id, folder_id и т.д.) берутся из секретов через env: `YC_CLOUD_ID` → `YANDEX_CLOUD_ID`, `YC_FOLDER_ID_STAGING` → `YANDEX_FOLDER_ID`, а также `YC_ACCESS_KEY` / `YC_SECRET_ACCESS_KEY` при использовании статических ключей.

---

## Production

Отдельный деплой в production в этом workflow не выполняется. Варианты:

- Добавить job или отдельный workflow, который срабатывает по тегу (например `v*`) или вручную (`workflow_dispatch`) и выполняет `terraform apply` с `-var-file=environments/prod/terraform.tfvars` и нужными тегами образов.
- Использовать отдельные секреты для prod (например `YC_FOLDER_ID_PROD`) и отдельное окружение в GitHub.

См. план деплоя (пункты 8–9): домен/TLS, деплой в production.

---

## Дополнительно

- Краткая справка по секретам и окружению: [.github/workflows/README.md](../../.github/workflows/README.md).
- Настройка облака и сервисных аккаунтов: [yandex-cloud-setup.md](yandex-cloud-setup.md).
