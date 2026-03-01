output "vpc_id" {
  value       = yandex_vpc_network.main.id
  description = "ID сети VPC"
}

output "subnet_id" {
  value       = yandex_vpc_subnet.main.id
  description = "ID подсети"
}
