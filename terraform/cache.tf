# Create a Memorystore (Redis) instance for caching (currently disabled to reduce costs)
# resource "google_redis_instance" "main" {
  # name           = "spectralink-cache"
  # tier           = "BASIC"
  # memory_size_gb = 1
# 
  # region             = var.region
  # location_id        = "${var.region}-a"
  # authorized_network = google_compute_network.vpc.id
  # connect_mode       = "PRIVATE_SERVICE_ACCESS"
# 
  # redis_version = "REDIS_7_2"
  # display_name  = "SpectraLink Cache"
# 
  # depends_on = [google_service_networking_connection.private_connection]
# }