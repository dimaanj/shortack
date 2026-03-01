# Деплой Short Track в Yandex Cloud

Обзор процесса деплоя приложения в Yandex Cloud: от настройки облака до CI/CD.

---

## Порядок настройки

1. **[Настройка Yandex Cloud](yandex-cloud-setup.md)** — облако, каталог, биллинг, сервисные аккаунты для Terraform и CI.
2. **[Выбор опций деплоя](choices.md)** — зафиксировать варианты по хостингу, БД, CI и окружениям.
3. **Terraform** — создать инфраструктуру: реестр, VPC, Lockbox, Serverless Container (NextJS), VM (воркер), при необходимости Redis. См. [Terraform](terraform.md) и `terraform/README.md`.
4. **Образы** — собрать и запушить образы web и worker в реестр. См. [Docker](docker.md).
5. **Секреты** — заполнить Lockbox и привязать к контейнеру и VM. См. [Lockbox](lockbox.md).
6. **CI/CD** — настроить GitHub Actions (секреты, окружение staging). См. [CI/CD](ci.md).
7. **Production** — при необходимости: отдельный каталог/переменные, деплой по тегу или вручную, домен и TLS.

---

## Компоненты

| Компонент | Описание | Документация |
|-----------|----------|--------------|
| NextJS (web + API) | Serverless Container в Yandex Cloud | [Terraform](terraform.md#serverless-containers), [Docker](docker.md#образ-web) |
| BullMQ worker | Compute VM с Docker | [Terraform](terraform.md#compute-vm-worker), [Docker](docker.md#образ-worker-bullmq) |
| Redis | Managed Service for Redis (опционально) | [Terraform](terraform.md#redis) |
| Секреты | Lockbox (Secret Manager) | [Lockbox](lockbox.md) |
| CI/CD | GitHub Actions: lint, test, build, deploy staging | [CI/CD](ci.md) |

---

## Быстрый старт (после настройки облака)

```bash
# 1. Создать сервисные аккаунты (один раз)
export FOLDER_ID=<ваш_folder_id>
./scripts/yandex-create-service-accounts.sh

# 2. Terraform: подготовить tfvars и применить
cd terraform
cp environments/staging/terraform.tfvars.example environments/staging/terraform.tfvars
# Отредактировать cloud_id, folder_id, при необходимости redis_password
terraform init
terraform apply -var-file=environments/staging/terraform.tfvars

# 3. Собрать и запушить образы (или дождаться деплоя через CI при push в main)
docker build -f apps/web/Dockerfile -t cr.yandex/<REGISTRY_ID>/shortack-web:latest .
docker build -f workers/Dockerfile -t cr.yandex/<REGISTRY_ID>/shortack-worker:latest .
# docker login cr.yandex и docker push ...
```

Дальше: заполнить секреты в Lockbox ([lockbox](lockbox.md)), настроить секреты в GitHub для CI ([ci](ci.md)).

---

## Связанные документы

- [Аутентификация (Auth)](../auth/README.md) — конфигурация NextAuth, Telegram, OAuth2, email.
- План деплоя: `.cursor/plans/yandex_cloud_deploy_and_ci_cd_42a9ae2b.plan.md`.
