output "registry_id" {
  value       = module.registry.registry_id
  description = "ID Container Registry"
}

output "registry_endpoint" {
  value       = module.registry.registry_endpoint
  description = "Endpoint реестра для docker push/pull"
}

output "registry_puller_sa_id" {
  value       = module.registry.puller_sa_id
  description = "ID сервисного аккаунта для pull образов (контейнеры/VM)"
}

output "lockbox_secret_ids" {
  value       = module.lockbox.secret_ids
  description = "ID секретов Lockbox (значения задаются вручную через yc/консоль)"
}

output "vpc_id" {
  value       = module.vpc.vpc_id
  description = "ID сети VPC"
}

output "subnet_id" {
  value       = module.vpc.subnet_id
  description = "ID подсети (для Serverless Containers и VM)"
}

output "serverless_container_id" {
  value       = module.serverless_containers.container_id
  description = "ID Serverless Container (NextJS)"
}

output "worker_instance_id" {
  value       = module.compute_worker.instance_id
  description = "ID VM воркера"
}

output "redis_host" {
  value       = try(module.redis[0].host, null)
  description = "FQDN Redis (если создан)"
}
