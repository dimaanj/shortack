variable "name" {
  type        = string
  description = "Имя кластера Redis"
}

variable "folder_id" {
  type        = string
  description = "ID каталога"
}

variable "network_id" {
  type        = string
  description = "ID сети VPC"
}

variable "subnet_id" {
  type        = string
  description = "ID подсети"
}

variable "labels" {
  type        = map(string)
  default     = {}
}

variable "environment" {
  type        = string
  description = "PRODUCTION или PRESTABLE"
  default     = "PRODUCTION"
}

variable "resource_preset_id" {
  type        = string
  description = "Пресет хоста (например hm1.nano)"
  default     = "hm1.nano"
}

variable "redis_version" {
  type        = string
  default     = "7.0"
  description = "Версия Redis"
}

variable "zone" {
  type        = string
  description = "Зона размещения хоста"
}

variable "redis_password" {
  type        = string
  sensitive   = true
  description = "Пароль Redis (сохраните в Lockbox)"
}
