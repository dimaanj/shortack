# Настройка Yandex Cloud: облако, каталог, биллинг, сервисные аккаунты

Пошаговая инструкция по **пункту 2** плана деплоя: создание облака и каталога, подключение биллинга, создание сервисных аккаунтов для Terraform и для CI.

Ссылка на план: [Yandex Cloud Deploy and CI/CD](../../.cursor/plans/yandex_cloud_deploy_and_ci_cd_42a9ae2b.plan.md).

---

## Предварительные требования

- Аккаунт в [Yandex](https://yandex.ru) или [Yandex 360](https://360.yandex.ru).
- Для биллинга — банковская карта или договор (для юрлиц).

---

## 1. Создание облака и каталога

### 1.1 Первый вход в Yandex Cloud

1. Откройте [консоль Yandex Cloud](https://console.cloud.yandex.ru).
2. Войдите под учётной записью Yandex.
3. При первом входе примите условия и при необходимости создайте **организацию** (для работы в команде) или продолжайте без неё.

### 1.2 Создание облака (Cloud)

- Если облака ещё нет: в консоли выберите **Создать облако**.
- Укажите имя (например, `shortack` или `short-track`).
- При необходимости привяжите организацию.

### 1.3 Создание каталога (Folder)

Каталог — контейнер ресурсов (VM, реестр, БД и т.д.). Рекомендуется отдельный каталог под проект.

**Через консоль:**

1. В левой панели выберите облако.
2. Перейдите в **Resource Manager** (Управление ресурсами) или выберите облако и нажмите **Создать каталог**.
3. Укажите имя каталога, например: `shortack-staging` для staging или один каталог `shortack` с окружениями внутри.

**Через CLI (после [установки yc](https://cloud.yandex.ru/docs/cli/quickstart)):**

```bash
# Инициализация (один раз): yc init
# Список облаков
yc resource-manager cloud list

# Создать каталог в указанном облаке
yc resource-manager folder create --name shortack --cloud-name <имя_облака>
```

Для двух окружений можно создать два каталога:

```bash
yc resource-manager folder create --name shortack-staging --cloud-name <имя_облака>
yc resource-manager folder create --name shortack-prod --cloud-name <имя_облака>
```

Сохраните **идентификаторы каталогов** (Folder ID) — они понадобятся для Terraform и CI.

```bash
yc resource-manager folder list
```

---

## 2. Подключение биллинга

Без подключённого биллинга большинство ресурсов создавать нельзя.

1. В консоли откройте [Биллинг](https://console.cloud.yandex.ru/billing).
2. Нажмите **Подключить платёжный аккаунт**.
3. Выберите тип: **Физическое лицо** или **Юридическое лицо**.
4. Укажите реквизиты и привяжите способ оплаты (карта или договор).
5. Свяжите платёжный аккаунт с облаком: **Облака** → **Привязать облако** → выберите созданное облако.

Подробнее: [Документация по биллингу](https://cloud.yandex.ru/docs/billing/).

---

## 3. Сервисный аккаунт для Terraform

Terraform будет создавать и менять ресурсы в каталоге от имени этого аккаунта.

### 3.1 Создание аккаунта

**Через консоль:**

1. Выберите каталог (например, `shortack` или `shortack-staging`).
2. Сервис **Identity and Access Management** (IAM).
3. Вкладка **Сервисные аккаунты** → **Создать сервисный аккаунт**.
4. Имя, например: `shortack-terraform`.

**Через CLI** (или один раз запустить скрипт из репозитория: `FOLDER_ID=<id> ./scripts/yandex-create-service-accounts.sh` — создаст оба аккаунта и назначит роли):

```bash
# Подставьте свой FOLDER_ID
export FOLDER_ID=<ваш_folder_id>

yc iam service-account create --name shortack-terraform --folder-id $FOLDER_ID
```

### 3.2 Роли для Terraform

Terraform должен уметь создавать реестр, VM, Redis, БД, Lockbox, VPC и т.д. Минимальный набор ролей на **каталог**:

| Роль | Назначение |
|------|------------|
| `editor` | Создание и изменение ресурсов (рекомендуется для старта) |
| или набор точечных ролей | `resource-manager.clouds.member`, `compute.admin`, `container-registry.admin`, `vpc.admin`, `lockbox.admin`, `serverless.containers.admin`, плюс роли для Redis и БД |

Для простоты на старте можно выдать роль **editor** на каталог.

**Через консоль:** IAM → Сервисные аккаунты → выберите `shortack-terraform` → **Назначить роли** → добавьте роль **editor** на каталог.

**Через CLI:**

```bash
# ID созданного сервисного аккаунта
SA_TERRAFORM_ID=$(yc iam service-account get shortack-terraform --folder-id $FOLDER_ID --format json | jq -r .id)

# Роль editor на каталог (полный доступ к ресурсам каталога)
yc resource-manager folder add-access-binding $FOLDER_ID \
  --role editor \
  --subject serviceAccount:$SA_TERRAFORM_ID
```

### 3.3 Статический ключ доступа для Terraform

Terraform будет использовать статический ключ этого сервисного аккаунта (или федерацию, если настроена).

**Через консоль:** IAM → Сервисные аккаунты → `shortack-terraform` → **Создать ключ** → **Создать статический ключ доступа**. Сохраните **Key ID** и **Secret** в безопасное место (например, в Lockbox или в секретах CI).

**Через CLI:**

```bash
yc iam access-key create --service-account-name shortack-terraform --folder-id $FOLDER_ID --description "terraform"
# Вывод: key_id и secret — сохраните их (secret показывается один раз).
```

В Terraform эти ключи задаются через переменные окружения или `backend`/provider:

```hcl
# В provider yandex (переменные окружения):
# YANDEX_CLOUD_ID, YANDEX_FOLDER_ID
# YANDEX_ACCESS_KEY / YANDEX_SECRET_KEY — ключи сервисного аккаунта Terraform
```

---

## 4. Сервисный аккаунт для CI (GitHub Actions / GitLab CI)

CI должен собирать образы, пушить их в Container Registry и при необходимости запускать деплой (обновление Serverless Containers, VM). Отдельный сервисный аккаунт ограничивает права только нужными операциями.

### 4.1 Создание аккаунта

**Через CLI (в том же каталоге):**

```bash
yc iam service-account create --name shortack-ci --folder-id $FOLDER_ID
SA_CI_ID=$(yc iam service-account get shortack-ci --folder-id $FOLDER_ID --format json | jq -r .id)
```

### 4.2 Роли для CI

| Роль | Назначение |
|------|------------|
| `container-registry.images.pusher` | Пуш образов в Container Registry |
| `container-registry.images.puller` | Пул образов (для кэша/проверок) |
| `serverless.containers.developer` | Деплой и обновление Serverless Containers |
| `compute.admin` или `compute.editor` | Обновление VM (образ воркера) при деплое |

При использовании Lockbox для секретов CI может понадобиться только если деплой читает секреты; обычно секреты читают уже контейнеры/VM с собственными ролями.

**Назначение ролей через CLI (каталог):**

```bash
# Пуш/пул образов в реестр
yc resource-manager folder add-access-binding $FOLDER_ID \
  --role container-registry.images.pusher \
  --subject serviceAccount:$SA_CI_ID
yc resource-manager folder add-access-binding $FOLDER_ID \
  --role container-registry.images.puller \
  --subject serviceAccount:$SA_CI_ID

# Деплой Serverless Containers
yc resource-manager folder add-access-binding $FOLDER_ID \
  --role serverless.containers.developer \
  --subject serviceAccount:$SA_CI_ID

# Управление VM (обновление образа воркера)
yc resource-manager folder add-access-binding $FOLDER_ID \
  --role compute.admin \
  --subject serviceAccount:$SA_CI_ID
```

### 4.3 Статический ключ для CI

Создайте статический ключ и сохраните **Key ID** и **Secret** в секретах GitHub (Settings → Secrets) или GitLab CI/CD Variables (masked):

```bash
yc iam access-key create --service-account-name shortack-ci --folder-id $FOLDER_ID --description "github-actions"
```

В GitHub Actions обычно задают переменные: `YC_ACCESS_KEY_ID`, `YC_SECRET_ACCESS_KEY`, `YC_FOLDER_ID`, при необходимости `YC_REGISTRY_ID`.

---

## 5. Сводка: что сохранить

После выполнения шагов сохраните в безопасном месте:

| Назначение | Что сохранить |
|------------|----------------|
| Terraform | Folder ID, Key ID и Secret сервисного аккаунта `shortack-terraform` |
| CI (GitHub/GitLab) | Folder ID, Key ID и Secret сервисного аккаунта `shortack-ci` |
| Общее | Cloud ID (для Terraform provider) |

Проверка доступа из CLI под своим пользователем:

```bash
yc config list
yc resource-manager folder list
```

Проверка от имени сервисного аккаунта (через ключи):

```bash
export YANDEX_ACCESS_KEY_ID=<key_id>
export YANDEX_SECRET_ACCESS_KEY=<secret>
export YANDEX_FOLDER_ID=<folder_id>
yc config profile create sa-terraform
yc config set service-account-key key.json   # если ключ сохранён в key.json
# или использовать переменные окружения в Terraform
```

---

## 6. Два каталога (Staging и Production)

Если созданы отдельные каталоги `shortack-staging` и `shortack-prod`:

- Повторите создание сервисных аккаунтов в **каждом** каталоге (например, `shortack-terraform` и `shortack-ci` в каждом),
  **или**
- Один сервисный аккаунт Terraform с ролью `resource-manager.clouds.member` и `editor` на оба каталога; один CI-аккаунт с правами на оба каталога (реестр и деплой в каждом).

Рекомендация: отдельные ключи для staging и prod (разные сервисные аккаунты или разные ключи) и разные секреты в CI для каждого окружения.

---

## Дальнейшие шаги

- **Пункт 3 плана**: Terraform — provider, Container Registry, Lockbox, VPC.
- Секреты (Key ID / Secret) для Terraform и CI можно позже перенести в Lockbox или в нативные секреты GitHub/GitLab.
