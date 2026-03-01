# VM для BullMQ worker: Ubuntu + Docker, контейнер из реестра
data "yandex_compute_image" "ubuntu" {
  family    = "ubuntu-2204-lts"
  folder_id = "standard-images"
}

locals {
  image_url = "cr.yandex/${var.registry_id}/${var.image_name}:${var.image_tag}"
  user_data = <<-EOT
#cloud-config
package_update: true
packages: [docker.io, jq]
runcmd:
  - systemctl enable docker
  - systemctl start docker
  - |
    # Авторизация в реестре: VM использует service_account_id с ролью container-registry.images.puller.
    # Для cr.yandex нужен docker login; токен можно получить через yc (см. docs).
    # Временное решение: пусть образ будет публичным или добавьте ключ SA в Lockbox и скрипт.
    docker pull ${local.image_url} || true
  - |
    docker run -d --restart=unless-stopped --name worker \
      -e NODE_ENV=production \
      ${local.image_url}
  EOT
}

resource "yandex_compute_instance" "worker" {
  folder_id = var.folder_id
  name      = var.name
  zone      = var.zone
  labels    = var.labels

  resources {
    cores  = var.cores
    memory = var.memory
  }

  boot_disk {
    initialize_params {
      image_id = data.yandex_compute_image.ubuntu.id
      size     = var.disk_size
      type     = "network-ssd"
    }
  }

  network_interface {
    subnet_id = var.subnet_id
    nat       = true
  }

  service_account_id = var.service_account_id

  metadata = {
    user-data = local.user_data
  }

  scheduling_policy {
    preemptible = false
  }
}
