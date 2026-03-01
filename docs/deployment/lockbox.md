# Деплой: секреты (Lockbox)

Как заполнять секреты в Yandex Lockbox и подключать их к Serverless Container и VM.

---

## Что уже создано Terraform

Модуль **lockbox** создаёт один секрет с именем вида `shortack-<env>-app-env` (например `shortack-staging-app-env`). Это заглушка: **payload (значения ключей) в Terraform не задаётся**, его нужно добавить вручную через консоль или CLI.

---

## Добавление payload через консоль

1. Откройте [Lockbox](https://console.cloud.yandex.ru/folders/<FOLDER_ID>/lockbox) в нужном каталоге.
2. Выберите секрет `shortack-<env>-app-env`.
3. Добавьте версию и ключи (пары имя → значение), например:
   - `NEXTAUTH_SECRET` — секрет для NextAuth
   - `NEXTAUTH_URL` — URL приложения (например `https://staging.example.com`)
   - `REDIS_URL` — строка подключения к Redis (если используется Managed Redis)
   - `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` — для Web Push
   - Креды Firebase/Marshrutochka и т.д., если нужны приложению

Имена ключей должны совпадать с переменными окружения, которые ожидает приложение.

---

## Добавление payload через CLI (yc)

```bash
# Установить yc и выполнить yc init
# ID секрета — из terraform output lockbox_secret_ids или консоли

yc lockbox payload add \
  --id <SECRET_ID> \
  --key NEXTAUTH_SECRET \
  --value "your-nextauth-secret"

yc lockbox payload add --id <SECRET_ID> --key REDIS_URL --value "redis://:password@redis-host:6379"
# и т.д.
```

Добавление нескольких ключей: вызвать `payload add` для каждого ключа (или добавить новую версию секрета с полным набором ключей через консоль).

---

## Подключение секрета к Serverless Container

В Terraform секреты передаются в модуль **serverless-containers** через переменную `lockbox_secret_env`: для каждого ключа указывается, в какую переменную окружения в контейнере он попадёт.

В корневом [terraform/main.tf](../../terraform/main.tf) сейчас передаётся пустой список:

```hcl
lockbox_secret_env = []
```

Чтобы подставить секрет приложения (один секрет с ключами NEXTAUTH_SECRET, REDIS_URL и т.д.), нужно передать привязки. Пример для одного секрета с ключами, имена которых совпадают с ENV:

```hcl
lockbox_secret_env = [
  { secret_id = module.lockbox.secret_ids.app, key = "NEXTAUTH_SECRET", env = "NEXTAUTH_SECRET" },
  { secret_id = module.lockbox.secret_ids.app, key = "NEXTAUTH_URL",    env = "NEXTAUTH_URL" },
  { secret_id = module.lockbox.secret_ids.app, key = "REDIS_URL",      env = "REDIS_URL" },
  # добавьте остальные ключи из payload
]
```

После изменения выполните `terraform apply` с тем же var-file.

---

## Подключение секретов к VM (worker)

Сейчас VM запускает контейнер с переменными только из cloud-init (например `NODE_ENV=production`). Передать в контейнер значения из Lockbox можно так:

- **Вариант 1.** При старте VM выполнять скрипт, который получает payload из Lockbox (через yc или API с IAM-токеном сервисного аккаунта VM) и запускает `docker run` с `-e VAR=value`.
- **Вариант 2.** Хранить чувствительные значения в Lockbox и при деплое (CI или вручную) подставлять их в user-data или в отдельный конфиг, который монтируется в контейнер (сложнее и менее безопасно, если user-data логируется).

Рекомендуется вариант 1: сервисному аккаунту VM выдать роль `lockbox.payloadViewer` на нужный секрет, в cloud-init или systemd-unit вызывать скрипт, который получает payload и запускает контейнер с `-e`.

---

## Права сервисного аккаунта

Чтобы контейнер или VM могли читать секрет, их сервисный аккаунт должен иметь доступ к Lockbox. Обычно назначают роль **lockbox.payloadViewer** на конкретный секрет (или на каталог). В Terraform это можно задать через `yandex_lockbox_secret_iam_binding` / `yandex_lockbox_secret_iam_member`, передав ID сервисного аккаунта, который используется Serverless Container и VM (например `module.registry.puller_sa_id`).

Пример (в корне или в модуле lockbox):

```hcl
resource "yandex_lockbox_secret_iam_member" "puller" {
  secret_id = yandex_lockbox_secret.app.id
  role     = "lockbox.payloadViewer"
  member   = "serviceAccount:${var.service_account_id}"
}
```

При необходимости добавьте переменную `service_account_id` в модуль lockbox и передайте туда ID SA контейнера/VM.

---

## Итог

1. Создать секрет в Lockbox (уже есть заглушка из Terraform).
2. Добавить payload (ключи и значения) через консоль или `yc lockbox payload add`.
3. В Terraform задать `lockbox_secret_env` для Serverless Container и применить изменения.
4. Для VM — выдать SA VM роль `lockbox.payloadViewer` и доработать cloud-init/скрипт запуска контейнера с подстановкой переменных из Lockbox.

См. также: [yandex-cloud-setup.md](yandex-cloud-setup.md) (создание SA), [terraform.md](terraform.md) (модули и переменные).
