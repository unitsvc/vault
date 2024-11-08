/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */
import { pathBreadcrumbs } from 'vault/utils/path-breadcrumbs';
import type { Breadcrumb } from 'vault/vault/app-types';

export const ldapBreadcrumbs = (
  fullPath: string | undefined, // i.e. path/to/item
  roleType: string,
  mountPath: string,
  lastItemCurrent = false // this array of objects can be spread anywhere within the crumbs array
): Breadcrumb[] => {
  const buildItemCrumb = (segment: string, isLast: boolean, lastIsDirectory: boolean) => {
    const itemPath = isLast && !lastIsDirectory ? segment : `${segment}/`;
    return {
      models: [mountPath, roleType, itemPath],
      route: isLast && !lastIsDirectory ? 'roles.role.details' : 'roles.subdirectory',
    };
  };
  return pathBreadcrumbs(fullPath, lastItemCurrent, buildItemCrumb);
};
