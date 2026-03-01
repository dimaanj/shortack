output "container_id" {
  value       = yandex_serverless_container.web.id
  description = "ID Serverless Container"
}

output "container_name" {
  value       = yandex_serverless_container.web.name
  description = "Имя контейнера"
}
