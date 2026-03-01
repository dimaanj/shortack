# VPC для Serverless Containers и Compute VM
resource "yandex_vpc_network" "main" {
  folder_id = var.folder_id
  name      = var.name
  labels    = var.labels
}

resource "yandex_vpc_subnet" "main" {
  folder_id     = var.folder_id
  name          = "${var.name}-subnet"
  network_id    = yandex_vpc_network.main.id
  zone          = var.zone
  v4_cidr_blocks = var.subnet_cidrs
  labels        = var.labels
}
