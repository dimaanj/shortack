output "cluster_id" {
  value       = yandex_mdb_redis_cluster.main.id
  description = "ID кластера Redis"
}

output "host" {
  value       = try(yandex_mdb_redis_cluster.main.host[0].fqdn, null)
  description = "FQDN хоста Redis"
}

output "connection_string" {
  value       = "redis://:${var.redis_password}@${try(yandex_mdb_redis_cluster.main.host[0].fqdn, "")}:6379"
  description = "Строка подключения (пароль — sensitive)"
  sensitive   = true
}
