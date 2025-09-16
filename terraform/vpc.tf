# Create a VPC network for private communication
resource "google_compute_network" "vpc" {
  name                    = "spectralink-vpc"
  auto_create_subnetworks = false
}

# Create a subnet within the VPC
resource "google_compute_subnetwork" "main" {
  name                     = "spectralink-subnet"
  ip_cidr_range            = "10.0.0.0/16"
  region                   = var.region
  network                  = google_compute_network.vpc.id
  private_ip_google_access = true
}

# Allocate an address range for private services
resource "google_compute_global_address" "private_ip_address" {
  name          = "private-ip-address"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc.id
}

# Create a private service connection for Cloud SQL and Memorystore
resource "google_service_networking_connection" "private_connection" {
  network                 = google_compute_network.vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
}