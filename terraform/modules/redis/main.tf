# Managed Service for Redis
resource "yandex_mdb_redis_cluster" "main" {
  folder_id   = var.folder_id
  name        = var.name
  environment = var.environment
  network_id  = var.network_id
  labels      = var.labels

  config {
    password = var.redis_password
    version  = var.redis_version
  }

  resources {
    resource_preset_id = var.resource_preset_id
    disk_size         = 16
  }

  host {
    zone      = var.zone
    subnet_id = var.subnet_id
  }
}
