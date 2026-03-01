# Serverless Container для NextJS (web + API)
resource "yandex_serverless_container" "web" {
  folder_id = var.folder_id
  name      = var.name
  memory    = var.memory
  cores     = var.cores
  labels    = var.labels

  image {
    url = "cr.yandex/${var.registry_id}/${var.image_name}:${var.image_tag}"
  }

  service_account_id = var.service_account_id

  connectivity {
    network_id = var.network_id
    subnet_id  = var.subnet_ids[0]
  }

  # Переменные окружения (базовые; остальное из Lockbox)
  environment = {
    PORT = tostring(var.port)
    NODE_ENV = "production"
  }

  # Секреты Lockbox: key = ключ в payload, environment_variable = имя env в контейнере
  dynamic "secrets" {
    for_each = var.lockbox_secret_env
    content {
      id                   = each.value.secret_id
      key                  = each.value.key
      environment_variable = each.value.env
    }
  }

  scaling_policy {
    min_instances = 0
    max_instances = 5
  }

  concurrency       = var.concurrency
  execution_timeout = "60s"
}
