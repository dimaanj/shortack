# Сервисный аккаунт для pull образов (используется Serverless Containers и VM при запуске)
resource "yandex_iam_service_account" "registry_puller" {
  folder_id = var.folder_id
  name      = "${var.name}-registry-puller"
}

# Container Registry для образов NextJS и worker
resource "yandex_container_registry" "main" {
  name      = var.name
  folder_id = var.folder_id
  labels    = var.labels
}

# Право на pull образов из реестра
resource "yandex_container_registry_iam_member" "puller" {
  registry_id = yandex_container_registry.main.id
  role        = "container-registry.images.puller"
  member      = "serviceAccount:${yandex_iam_service_account.registry_puller.id}"
}
