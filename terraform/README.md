# Terraform — Short Track (Yandex Cloud)

Пункт 3 плана деплоя: Container Registry, Lockbox (заглушки секретов), VPC.

## Что создаётся

- **Container Registry** — реестр образов + сервисный аккаунт с ролью `container-registry.images.puller` (для Serverless Containers и VM).
- **Lockbox** — один секрет-заглушка `shortack-<env>-app-env`. Значения (payload) задаются вручную через [консоль](https://console.cloud.yandex.ru) или `yc lockbox payload add`.
- **VPC** — сеть и подсеть в указанной зоне для контейнеров и VM.
- **Serverless Container** — NextJS (web + API); образ и тег задаются переменными `web_image_tag` / через CI.
- **Compute VM** — BullMQ worker; образ задаётся переменной `worker_image_tag`.
- **Managed Redis** (опционально) — создаётся при заданной переменной `redis_password` в tfvars.

## Требования

- [Terraform](https://www.terraform.io/downloads) >= 1.5
- [Yandex Cloud provider](https://registry.terraform.io/providers/yandex-cloud/yandex/latest) ~> 0.100
- Настроенный каталог и сервисный аккаунт для Terraform (см. [docs/deployment/yandex-cloud-setup.md](../docs/deployment/yandex-cloud-setup.md))

## Аутентификация

Задайте переменные окружения (статический ключ SA для Terraform):

```bash
export YANDEX_CLOUD_ID=<cloud_id>
export YANDEX_FOLDER_ID=<folder_id>
export YANDEX_ACCESS_KEY=<key_id>
export YANDEX_SECRET_ACCESS_KEY=<secret>
```

Либо OAuth-токен: `YANDEX_TOKEN=<token>`.

## Запуск

```bash
cd terraform

# Инициализация (один раз)
terraform init

# Выберите окружение: подставьте свои cloud_id и folder_id в tfvars
cp environments/staging/terraform.tfvars.example environments/staging/terraform.tfvars
# Отредактируйте environments/staging/terraform.tfvars

# План и применение
terraform plan -var-file=environments/staging/terraform.tfvars
terraform apply -var-file=environments/staging/terraform.tfvars
```

Для production используйте `environments/prod/terraform.tfvars` и свой `folder_id` prod.

## Backend (state)

По умолчанию state хранится локально (`backend "local"`). Для production рекомендуется Object Storage + блокировка (см. [docs/deployment/choices.md](../docs/deployment/choices.md)). Пример переключения на S3-совместимый backend в Yandex Object Storage можно добавить в `versions.tf` после создания bucket.

## Переменные образов и Redis

- `web_image_tag`, `worker_image_tag` — теги образов (по умолчанию `latest`). CI при деплое подставляет короткий SHA.
- `redis_password` — при задании создаётся Managed Redis; без него модуль Redis не создаётся.

## Дальнейшие шаги (план)

- Пункт 6: Настройка секретов в Lockbox и привязка к контейнеру/VM.
- Пункт 8–9: Домен/TLS, деплой в production.
