variable "name" {
  type        = string
  description = "Имя реестра и префикс ресурсов"
}

variable "folder_id" {
  type        = string
  description = "ID каталога"
}

variable "labels" {
  type        = map(string)
  description = "Метки ресурсов"
  default     = {}
}
