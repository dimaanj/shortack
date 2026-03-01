variable "name" {
  type        = string
  description = "Имя сети и подсети"
}

variable "folder_id" {
  type        = string
  description = "ID каталога"
}

variable "zone" {
  type        = string
  description = "Зона (например ru-central1-a)"
}

variable "labels" {
  type        = map(string)
  description = "Метки ресурсов"
  default     = {}
}

variable "subnet_cidrs" {
  type        = list(string)
  description = "CIDR подсети (по одной на зону)"
  default     = ["10.0.1.0/24"]
}
