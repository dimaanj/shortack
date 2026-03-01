output "secret_ids" {
  value = {
    app = yandex_lockbox_secret.app.id
  }
  description = "ID секретов Lockbox (значения задаются вручную через yc/консоль)"
}
