#!/usr/bin/env bash
# Создание сервисных аккаунтов для Terraform и CI в каталоге Yandex Cloud.
# Использование: FOLDER_ID=<id> ./scripts/yandex-create-service-accounts.sh
# Требуется: yc CLI, jq, уже созданный каталог и настроенный yc (yc init).

set -e

if [ -z "$FOLDER_ID" ]; then
  echo "Укажите FOLDER_ID (идентификатор каталога Yandex Cloud)."
  echo "Пример: FOLDER_ID=b1gxxxxxxxxxxxx ./scripts/yandex-create-service-accounts.sh"
  exit 1
fi

echo "Каталог: $FOLDER_ID"
echo "Создание сервисного аккаунта для Terraform..."
yc iam service-account create --name shortack-terraform --folder-id "$FOLDER_ID" 2>/dev/null || true
SA_TERRAFORM_ID=$(yc iam service-account get shortack-terraform --folder-id "$FOLDER_ID" --format json | jq -r .id)
echo "  ID: $SA_TERRAFORM_ID"

echo "Назначение роли editor для Terraform..."
yc resource-manager folder add-access-binding "$FOLDER_ID" \
  --role editor \
  --subject serviceAccount:"$SA_TERRAFORM_ID" 2>/dev/null || true

echo "Создание сервисного аккаунта для CI..."
yc iam service-account create --name shortack-ci --folder-id "$FOLDER_ID" 2>/dev/null || true
SA_CI_ID=$(yc iam service-account get shortack-ci --folder-id "$FOLDER_ID" --format json | jq -r .id)
echo "  ID: $SA_CI_ID"

for role in container-registry.images.pusher container-registry.images.puller serverless.containers.editor compute.admin; do
  echo "  Роль $role..."
  yc resource-manager folder add-access-binding "$FOLDER_ID" \
    --role "$role" \
    --subject serviceAccount:"$SA_CI_ID" 2>/dev/null || true
done

echo ""
echo "Сервисные аккаунты созданы. Создайте статические ключи и сохраните их в безопасном месте:"
echo ""
echo "# Ключ для Terraform:"
echo "yc iam access-key create --service-account-name shortack-terraform --folder-id $FOLDER_ID --description terraform"
echo ""
echo "# Ключ для CI (GitHub Actions / GitLab):"
echo "yc iam access-key create --service-account-name shortack-ci --folder-id $FOLDER_ID --description github-actions"
echo ""
echo "Переменные для Terraform: YANDEX_FOLDER_ID=$FOLDER_ID, YANDEX_ACCESS_KEY_ID, YANDEX_SECRET_ACCESS_KEY (ключ shortack-terraform)."
echo "Секреты для CI: YC_FOLDER_ID=$FOLDER_ID, YC_ACCESS_KEY_ID, YC_SECRET_ACCESS_KEY (ключ shortack-ci)."
