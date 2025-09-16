# Create a Cloud SQL instance
resource "google_sql_database_instance" "main" {
  name             = "spectralink-db"
  region           = var.region
  database_version = "MYSQL_8_0"

  depends_on = [google_service_networking_connection.private_connection]

  settings {
    tier = "db-f1-micro" # Cheapest tier

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.id
    }
  }

  deletion_protection = false # Set to "true" for production
}

# Private service connection
resource "google_compute_network_peering_routes_config" "main" {
  peering              = google_service_networking_connection.private_connection.peering
  network              = google_compute_network.vpc.name
  import_custom_routes = true
  export_custom_routes = true
}

# Create a database and user for your app
resource "google_sql_database" "main" {
  name      = "spectralink"
  instance  = google_sql_database_instance.main.name
  charset   = "utf8mb4"
  collation = "utf8mb4_unicode_ci"
}

resource "google_sql_user" "main" {
  name     = "spectralink"
  instance = google_sql_database_instance.main.name
  password = var.database_password
}

# Create Cloud Run Job for DB initialization
resource "google_cloud_run_v2_job" "db_init" {
  name                = "db-init-job"
  location            = var.region
  deletion_protection = false

  template {
    template {
      containers {
        image = var.db_init_image
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
      }
      vpc_access {
        network_interfaces {
          network    = google_compute_network.vpc.name
          subnetwork = google_compute_subnetwork.main.name
        }
      }
    }
  }

  depends_on = [
    google_sql_database.main,
    google_sql_database_instance.main
  ]
}