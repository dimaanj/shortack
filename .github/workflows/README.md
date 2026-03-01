# CI/CD (GitHub Actions)

## Секреты репозитория

Для деплоя в staging настройте в **Settings → Secrets and variables → Actions**:

| Секрет | Описание |
|--------|----------|
| `YC_CLOUD_ID` | ID облака Yandex Cloud |
| `YC_FOLDER_ID_STAGING` | ID каталога staging |
| `YC_REGISTRY_ID` | ID Container Registry (из вывода Terraform: registry_id) |
| `YC_OAUTH_TOKEN` | OAuth-токен Yandex (для `docker login` и Terraform). Либо используйте статические ключи SA для Terraform: `YC_ACCESS_KEY`, `YC_SECRET_ACCESS_KEY` (тогда для docker login нужен отдельный токен или JSON ключ SA в `YC_SA_JSON_KEY`) |

Для входа в реестр из CI можно вместо OAuth использовать статический ключ сервисного аккаунта (shortack-ci): сохраните JSON ключа в секрет `YC_SA_JSON_KEY` и в workflow замените шаг логина на `echo "${{ secrets.YC_SA_JSON_KEY }}" | docker login --username json_key --password-stdin cr.yandex`.

## Окружение staging

В **Settings → Environments** создайте окружение `staging` (опционально с правилами защиты). Переменные окружения можно задать там же.

## Поведение

- **На PR**: lint, test (если есть), build.
- **На push в main**: то же + сборка образов web и worker, push в Container Registry, `terraform apply` в staging с тегом образа = короткий SHA коммита.
