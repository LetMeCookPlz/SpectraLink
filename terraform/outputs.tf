output "cloud_run_url" {
  description = "The URL where the Next.js app is accessible"
  value       = google_cloud_run_v2_service.main.uri
}