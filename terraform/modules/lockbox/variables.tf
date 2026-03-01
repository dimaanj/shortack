variable "folder_id" {
  type        = string
  description = "ID каталога"
}

variable "name" {
  type        = string
  description = "Префикс имён секретов"
}

variable "labels" {
  type        = map(string)
  description = "Метки ресурсов"
  default     = {}
}
