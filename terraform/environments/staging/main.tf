# Конфигурация staging: переменные задаются в terraform.tfvars в этой папке.
# Запуск из корня terraform/:
#   terraform plan -var-file=environments/staging/terraform.tfvars
#   terraform apply -var-file=environments/staging/terraform.tfvars
# Основные ресурсы объявлены в ../../main.tf.
