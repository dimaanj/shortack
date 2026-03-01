variable "name" {
  type        = string
  description = "Имя VM"
}

variable "folder_id" {
  type        = string
  description = "ID каталога"
}

variable "zone" {
  type        = string
  description = "Зона"
}

variable "subnet_id" {
  type        = string
  description = "ID подсети"
}

variable "service_account_id" {
  type        = string
  description = "ID сервисного аккаунта (pull образов, доступ к Lockbox)"
}

variable "registry_id" {
  type        = string
  description = "ID Container Registry"
}

variable "image_name" {
  type        = string
  default     = "shortack-worker"
  description = "Имя образа воркера в реестре"
}

variable "image_tag" {
  type        = string
  default     = "latest"
  description = "Тег образа"
}

variable "labels" {
  type        = map(string)
  default     = {}
}

variable "cores" {
  type        = number
  default     = 2
  description = "Количество vCPU"
}

variable "memory" {
  type        = number
  default     = 2
  description = "Память в ГБ"
}

variable "disk_size" {
  type        = number
  default     = 20
  description = "Размер загрузочного диска в ГБ"
}

variable "lockbox_secret_id" {
  type        = string
  description = "ID секрета Lockbox (опционально, для env)"
  default     = null
}
