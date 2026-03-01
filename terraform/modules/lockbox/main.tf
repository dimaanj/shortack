# Заглушки секретов Lockbox. Значения (payload) задаются через консоль или yc:
#   yc lockbox payload add --id <secret_id> --key KEY_NAME --value "value"
# Список типичных ключей см. в docs/deployment/lockbox.md

resource "yandex_lockbox_secret" "app" {
  folder_id = var.folder_id
  name      = "${var.name}-app-env"
  labels    = var.labels
  # Payload добавляется вручную или через yandex_lockbox_secret_version (с sensitive data)
}
