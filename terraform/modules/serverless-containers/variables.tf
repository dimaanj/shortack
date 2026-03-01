variable "name" {
  type        = string
  description = "Имя контейнера"
}

variable "folder_id" {
  type        = string
  description = "ID каталога"
}

variable "registry_id" {
  type        = string
  description = "ID Container Registry"
}

variable "image_name" {
  type        = string
  description = "Имя образа в реестре (например shortack-web)"
  default     = "shortack-web"
}

variable "image_tag" {
  type        = string
  description = "Тег образа (например latest или sha)"
  default     = "latest"
}

variable "service_account_id" {
  type        = string
  description = "ID сервисного аккаунта для pull и доступа к Lockbox"
}

variable "network_id" {
  type        = string
  description = "ID сети VPC"
}

variable "subnet_ids" {
  type        = list(string)
  description = "ID подсетей для контейнера"
}

variable "memory" {
  type        = number
  description = "Память в МБ (кратно 128)"
  default     = 512
}

variable "cores" {
  type        = number
  description = "Количество vCPU"
  default     = 1
}

# Список привязок: secret_id -> { key = ключ в payload, env = имя ENV }
variable "lockbox_secret_env" {
  type = list(object({
    secret_id = string
    key       = string
    env       = string
  }))
  description = "Привязка ключей Lockbox к переменным окружения"
  default     = []
}

variable "labels" {
  type        = map(string)
  default     = {}
}

variable "port" {
  type        = number
  description = "Порт приложения в контейнере"
  default     = 3000
}

variable "concurrency" {
  type        = number
  description = "Максимум одновременных запросов на инстанс"
  default     = 10
}
