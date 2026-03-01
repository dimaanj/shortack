terraform {
  required_version = ">= 1.5"

  required_providers {
    yandex = {
      source  = "yandex-cloud/yandex"
      version = "~> 0.100"
    }
  }

  # Для dev — локальный state. Для prod см. docs/deployment/choices.md (Object Storage + блокировка).
  backend "local" {
    path = "terraform.tfstate"
  }
}
