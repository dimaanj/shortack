# Деплой: инфраструктура (Terraform)

Краткое описание инфраструктуры в Yandex Cloud и как ею управлять через Terraform. Подробные команды и примеры — в [terraform/README.md](../../terraform/README.md).

---

## Структура каталогов

```
terraform/
├── versions.tf      # Terraform и provider yandex, backend (local)
├── variables.tf     # cloud_id, folder_id, environment, zone, образы, redis_password
├── main.tf         # Provider, вызов модулей
├── outputs.tf      # registry_id, vpc_id, subnet_id, container_id, instance_id, redis_host
├── modules/
│   ├── registry/             # Container Registry + SA для pull
│   ├── lockbox/              # Секрет-заглушка (payload вручную)
│   ├── vpc/                  # Сеть и подсеть
│   ├── serverless-containers/ # NextJS (Serverless Container)
│   ├── compute-worker/       # VM для BullMQ worker
│   └── redis/                # Managed Redis (опционально)
└── environments/
    ├── staging/
    │   ├── main.tf                    # Комментарии по запуску
    │   └── terraform.tfvars.example   # Пример переменных
    └── prod/
        └── terraform.tfvars.example
```

---

## Что создаётся

| Модуль | Ресурсы |
|--------|---------|
| **registry** | Container Registry, сервисный аккаунт с ролью `container-registry.images.puller` |
| **lockbox** | Один секрет Lockbox (имя вида `shortack-<env>-app-env`); значения задаются вручную |
| **vpc** | VPC и подсеть в одной зоне (по умолчанию 10.0.1.0/24) |
| **serverless-containers** | Serverless Container для NextJS: образ из реестра, память/cores, scaling 0–5, опционально секреты Lockbox |
| **compute-worker** | VM (Ubuntu 22.04), cloud-init: Docker, запуск контейнера воркера из реестра |
| **redis** | Managed Redis (один хост); создаётся только при заданном `redis_password` |

---

## Основные переменные

- **cloud_id**, **folder_id** — облако и каталог (обязательно).
- **environment** — `staging` или `prod` (метки и имена ресурсов).
- **zone** — зона по умолчанию, например `ru-central1-a`.
- **web_image_tag**, **worker_image_tag** — теги образов (по умолчанию `latest`); CI подставляет короткий SHA.
- **redis_password** — при задании создаётся Managed Redis; без переменной модуль Redis не создаётся.

Полный список — в `terraform/variables.tf` и в примерах `environments/*/terraform.tfvars.example`.

---

## Запуск

Аутентификация: переменные окружения `YANDEX_CLOUD_ID`, `YANDEX_FOLDER_ID`, `YANDEX_ACCESS_KEY`, `YANDEX_SECRET_ACCESS_KEY` (или `YANDEX_TOKEN`).

```bash
cd terraform
terraform init
terraform plan -var-file=environments/staging/terraform.tfvars
terraform apply -var-file=environments/staging/terraform.tfvars
```

Для обновления только образов при уже созданной инфраструктуре:

```bash
terraform apply -var-file=environments/staging/terraform.tfvars \
  -var="web_image_tag=<NEW_TAG>" -var="worker_image_tag=<NEW_TAG>"
```

---

## Serverless Containers

- Образ: `cr.yandex/<registry_id>/shortack-web:<web_image_tag>`.
- Сеть: используется подсеть из модуля `vpc`.
- Секреты Lockbox задаются через переменную `lockbox_secret_env` в вызове модуля (список привязок ключ секрета → переменная окружения). См. [Lockbox](lockbox.md).

---

## Compute VM (worker)

- Образ: `cr.yandex/<registry_id>/shortack-worker:<worker_image_tag>`.
- При первом запуске cloud-init устанавливает Docker и запускает контейнер. Авторизация в реестре: VM использует сервисный аккаунт с ролью `container-registry.images.puller`; при необходимости настройте логин в реестр через секреты или метаданные (см. комментарии в модуле).

---

## Redis

- Создаётся только если в tfvars задано `redis_password`.
- Строка подключения и хост выводятся в `terraform output` (redis_host; connection_string — sensitive).
- Пароль стоит хранить в Lockbox и передавать в приложение через переменные окружения.

---

## Backend (state)

По умолчанию state хранится локально (`backend "local"`). Для production рекомендуется backend в Yandex Object Storage с блокировкой. Варианты описаны в [choices.md](choices.md).

---

## Дополнительно

- [terraform/README.md](../../terraform/README.md) — требования, аутентификация, переменные образов и Redis.
- [yandex-cloud-setup.md](yandex-cloud-setup.md) — создание облака, каталога и сервисных аккаунтов.
