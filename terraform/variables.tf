variable "project_id" {
  description = "The GCP Project ID"
  type        = string
  default     = "spectralink-webapp"
}

variable "region" {
  description = "The GCP region for resources"
  type        = string
  default     = "europe-north1"
}

variable "app_image" {
  description = "The Docker image for the Next.js application"
  type        = string
}

variable "db_init_image" {
  description = "The Docker image for the DB initializer"
  type        = string
}

variable "database_password" {
  description = "The password for the Cloud SQL database"
  type        = string
  sensitive   = true
}

variable "nextauth_secret" {
  description = "The secret for NextAuth.js"
  type        = string
  sensitive   = true
}