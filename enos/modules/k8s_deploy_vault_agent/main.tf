terraform {
  required_version = ">= 1.2.0"
  required_providers {
    kubernetes = {
      source = "hashicorp/kubernetes"
    }
  }
}

locals {
  config_volume = "config-volume"
}

resource "kubernetes_service_account_v1" "vault_agent_service" {
  metadata {
    annotations = {
      "azure.workload.identity/client-id" : var.client_id
    }
    labels = {
      "azure.workload.identity/use" : "true"
    }
    name = var.service_account_name
  }
}

resource "kubernetes_config_map_v1" "agent-config" {
  metadata {
    name = "agent-config"
  }
  data = {
    "agent-config.hcl" : file(abspath("${path.module}/agent-config.hcl"))
  }
}

resource "kubernetes_pod_v1" "agent" {
  metadata {
    name = "vault-agent"
    labels = {
      "azure.workload.identity/use" : "true"
    }
  }
  spec {
    service_account_name = var.service_account_name
    container {
      name  = "vault-agent"
      image = "${var.docker_image_name}:${var.docker_image_tag}"
      args = [
        "agent",
        "-config=/etc/config/agent-config.hcl"
      ]
      env {
        name  = "VAULT_ADDR"
        value = "http://vault.default.svc.cluster.local:8200"
      }
      volume_mount {
        name       = local.config_volume
        mount_path = "/etc/config"
      }
    }
    volume {
      name = local.config_volume
      config_map {
        name = "agent-config"
      }
    }
  }

  depends_on = [
    kubernetes_config_map_v1.agent-config,
    kubernetes_service_account_v1.vault_agent_service,
  ]
}
