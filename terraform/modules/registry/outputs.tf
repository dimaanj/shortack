output "registry_id" {
  value       = yandex_container_registry.main.id
  description = "ID Container Registry"
}

output "registry_endpoint" {
  value       = "cr.yandex/${yandex_container_registry.main.id}"
  description = "Endpoint для docker push/pull (cr.yandex/REGISTRY_ID)"
}

output "puller_sa_id" {
  value       = yandex_iam_service_account.registry_puller.id
  description = "ID сервисного аккаунта для pull образов"
}
