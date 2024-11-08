/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { pathBreadcrumbs } from 'vault/utils/path-breadcrumbs';

/**
 * breadcrumbsForSecret is for generating page breadcrumbs for a secret path
 * @param {string} secretPath is the full path to secret (like 'my-secret' or 'beep/boop')
 * @param {boolean} lastItemCurrent
 * @returns array of breadcrumbs specific to KV engine
 */
export function breadcrumbsForSecret(backend, secretPath, lastItemCurrent = false) {
  if (!backend || !secretPath) return [];

  const buildSecretCrumb = (segment, isLastCrumb, lastIsDirectory) => {
    const itemPath = isLastCrumb && !lastIsDirectory ? segment : `${segment}/`;
    const route = isLastCrumb && !lastIsDirectory ? 'secret.index' : 'list-directory';
    return { models: [backend, itemPath], route };
  };

  return pathBreadcrumbs(secretPath, lastItemCurrent, buildSecretCrumb);
}
