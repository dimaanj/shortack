variable "cloud_id" {
  type        = string
  description = "Yandex Cloud ID"
}

variable "folder_id" {
  type        = string
  description = "ID каталога (folder)"
}

variable "environment" {
  type        = string
  description = "Окружение: staging или prod"
  default     = "staging"
}

# Переменные для provider (лучше задавать через env: YANDEX_CLOUD_ID, YANDEX_FOLDER_ID, YANDEX_ACCESS_KEY, YANDEX_SECRET_ACCESS_KEY)
variable "yandex_token" {
  type        = string
  default     = null
  sensitive   = true
  description = "OAuth-токен (если не используются статические ключи)"
}

variable "yandex_access_key" {
  type        = string
  default     = null
  sensitive   = true
  description = "Static key ID сервисного аккаунта для Terraform"
}

variable "yandex_secret_key" {
  type        = string
  default     = null
  sensitive   = true
  description = "Static key Secret сервисного аккаунта для Terraform"
}

variable "zone" {
  type        = string
  description = "Зона по умолчанию (например ru-central1-a)"
  default     = "ru-central1-a"
}

# Образы (тег обновляется CI при деплое)
variable "web_image_tag" {
  type        = string
  default     = "latest"
  description = "Тег образа NextJS в реестре"
}

variable "worker_image_tag" {
  type        = string
  default     = "latest"
  description = "Тег образа воркера в реестре"
}

# Redis (опционально: задайте redis_password для создания Managed Redis)
variable "redis_password" {
  type        = string
  default     = null
  sensitive   = true
  description = "Пароль Redis для Managed Service (если null — модуль redis не создаётся)"
}
