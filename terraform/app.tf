# Deploy the Next.js app with Cloud Run
resource "google_cloud_run_v2_service" "main" {
  name                = "spectralink-app"
  location            = var.region
  deletion_protection = false # Set to "true" for production

  # The container configuration
  template {
    containers {
      image = var.app_image

      env {
        name  = "MYSQL_HOST"
        value = google_sql_database_instance.main.private_ip_address
      }
      env {
        name  = "MYSQL_USER"
        value = google_sql_user.main.name
      }
      env {
        name  = "MYSQL_PASSWORD"
        value = var.database_password
      }
      env {
        name  = "MYSQL_DB"
        value = google_sql_database.main.name
      }
      env {
        name  = "REDIS_HOST"
        value = google_redis_instance.main.host
      }
      env {
        name  = "NEXTAUTH_SECRET"
        value = var.nextauth_secret
      }
    }

    vpc_access {
      network_interfaces {
        network    = google_compute_network.vpc.name
        subnetwork = google_compute_subnetwork.main.name
      }
    }
  }

  # Define the traffic assignment (100% to latest revision)
  traffic {
    percent = 100
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
  }

  depends_on = [
    google_sql_database.main,
    google_sql_database_instance.main,
    google_redis_instance.main
  ]
}

# Allow unauthenticated users to invoke the Cloud Run service
resource "google_cloud_run_v2_service_iam_member" "noauth" {
  location = var.region
  name     = google_cloud_run_v2_service.main.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}