output "instance_id" {
  value       = yandex_compute_instance.worker.id
  description = "ID VM воркера"
}

output "internal_ip" {
  value       = yandex_compute_instance.worker.network_interface[0].ip_address
  description = "Внутренний IP"
}

output "nat_ip" {
  value       = try(yandex_compute_instance.worker.network_interface[0].nat_ip_address, null)
  description = "Публичный IP (если nat = true)"
}
