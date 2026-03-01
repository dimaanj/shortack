# Конфигурация production: переменные задаются в terraform.tfvars в этой папке.
# Запуск из корня terraform/:
#   terraform plan -var-file=environments/prod/terraform.tfvars
#   terraform apply -var-file=environments/prod/terraform.tfvars
# Основные ресурсы объявлены в ../../main.tf.
