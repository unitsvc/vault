# Copyright (c) HashiCorp, Inc.
# SPDX-License-Identifier: BUSL-1.1

locals {
  // Variables
  pki_mount                 = "pki" # secret
  pki_issuer_name           = "issuer"
  pki_common_name           = "common"
  pki_default_ttl           = "72h"
  pki_test_data_path_prefix = "smoke"
  pki_tmp_test_results      = "tmp-test-results"

  // Output
  pki_output = {
    mount        = local.pki_mount
    common_name  = local.pki_common_name
    test_results = local.pki_tmp_test_results
  }

  test = {
    path_prefix = local.pki_test_data_path_prefix
  }
}

output "pki" {
  value = local.pki_output
}

# Enable pki secrets engine
resource "enos_remote_exec" "secrets_enable_pki_secret" {
  environment = {
    ENGINE            = local.pki_mount
    MOUNT             = local.pki_mount
    VAULT_ADDR        = var.vault_addr
    VAULT_TOKEN       = var.vault_root_token
    VAULT_INSTALL_DIR = var.vault_install_dir
  }

  scripts = [abspath("${path.module}/../../scripts/secrets-enable.sh")]

  transport = {
    ssh = {
      host = var.leader_host.public_ip
    }
  }
}

# Issue RSA Certificate
resource "enos_remote_exec" "pki_issue_certificates" {
  depends_on = [enos_remote_exec.secrets_enable_pki_secret]
  for_each   = var.hosts

  environment = {
    MOUNT             = local.pki_mount
    VAULT_ADDR        = var.vault_addr
    VAULT_INSTALL_DIR = var.vault_install_dir
    VAULT_TOKEN       = var.vault_root_token
    COMMON_NAME       = local.pki_common_name
    ISSUER_NAME       = local.pki_issuer_name
    TTL               = local.pki_default_ttl
    TMP_TEST_RESULTS  = local.pki_tmp_test_results
  }

  scripts = [abspath("${path.module}/../../scripts/kv-pki-issue-certificates.sh")]

  transport = {
    ssh = {
      host = each.value.public_ip
    }
  }
}

