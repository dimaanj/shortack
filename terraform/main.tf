provider "yandex" {
  cloud_id  = var.cloud_id
  folder_id = var.folder_id
  zone      = var.zone

  token     = var.yandex_token
  access_key = var.yandex_access_key
  secret_key = var.yandex_secret_key
}

locals {
  common_labels = {
    project     = "shortack"
    environment = var.environment
    managed-by  = "terraform"
  }
}

# Container Registry + сервисный аккаунт для pull/push
module "registry" {
  source = "./modules/registry"

  name      = "shortack-${var.environment}"
  folder_id = var.folder_id
  labels    = local.common_labels
}

# Lockbox: заглушки секретов (значения задаются через yc/консоль или lockbox_secret_version)
module "lockbox" {
  source = "./modules/lockbox"

  folder_id = var.folder_id
  name      = "shortack-${var.environment}"
  labels    = local.common_labels
}

# VPC и подсеть для Serverless Containers и Compute VM
module "vpc" {
  source = "./modules/vpc"

  name       = "shortack-${var.environment}"
  folder_id  = var.folder_id
  zone       = var.zone
  labels     = local.common_labels
}

# Serverless Container — NextJS (web + API)
module "serverless_containers" {
  source = "./modules/serverless-containers"

  name               = "shortack-web-${var.environment}"
  folder_id          = var.folder_id
  registry_id        = module.registry.registry_id
  image_name        = "shortack-web"
  image_tag         = var.web_image_tag
  service_account_id = module.registry.puller_sa_id
  network_id        = module.vpc.vpc_id
  subnet_ids        = [module.vpc.subnet_id]
  lockbox_secret_env = [] # Добавьте привязки ключей Lockbox к ENV при настройке секретов
  labels            = local.common_labels
}

# Compute VM — BullMQ worker
module "compute_worker" {
  source = "./modules/compute-worker"

  name                = "shortack-worker-${var.environment}"
  folder_id           = var.folder_id
  zone                = var.zone
  subnet_id           = module.vpc.subnet_id
  service_account_id  = module.registry.puller_sa_id
  registry_id         = module.registry.registry_id
  image_name          = "shortack-worker"
  image_tag           = var.worker_image_tag
  labels              = local.common_labels
}

# Managed Redis (создаётся только при заданном redis_password)
module "redis" {
  source = "./modules/redis"
  count  = var.redis_password != null ? 1 : 0

  name             = "shortack-${var.environment}"
  folder_id        = var.folder_id
  network_id       = module.vpc.vpc_id
  subnet_id        = module.vpc.subnet_id
  zone             = var.zone
  redis_password   = var.redis_password
  labels           = local.common_labels
}
