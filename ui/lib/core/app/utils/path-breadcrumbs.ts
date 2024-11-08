/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */
import { assert } from '@ember/debug';
import type { Breadcrumb } from 'vault/vault/app-types';

/*
pathBreadcrumbs generates an array of objects from items that use path-style names.
it splits the path on the forward slash and creates a "segment" for each section, 
each segment is a continued concatenation of ancestral paths.
for example, if the full path to an item is "prod/admin/west"
the segments will be: prod, prod/admin, prod/admin/west

the buildItemCrumb function is responsible for logic that builds the dynamic portion of 
the URL, such as the route and model(s) 
For example, some crumbs will need a trailing slash to denote navigating to a directory vs details view
*/

type BuildCrumbFunction = (
  segment: string,
  isLastCrumb: boolean,
  lastIsDirectory: boolean
) => {
  model?: string;
  models?: string[];
  route: string;
};

const assertFunction = (keys: string[]) => {
  const hasRoute = keys.includes('route');
  const hasModel = ['model', 'models'].some((k) => keys.includes(k));
  const msg = '"buildItemCrumb" function must return an object with a';
  assert(msg + ' "route" key', hasRoute);
  assert(msg + ' "model" or "models" key', hasModel);
};

export const pathBreadcrumbs = (
  fullPath: string | undefined, // path/to/item
  lastItemCurrent = false,
  buildItemCrumb: BuildCrumbFunction
): Breadcrumb[] => {
  if (!fullPath) return [];

  const ancestry = fullPath.split('/').filter((path) => path !== '');
  const lastIsDirectory = fullPath.endsWith('/');

  return ancestry.map((name: string, idx: number) => {
    const isLastCrumb = ancestry.length === idx + 1;

    // if the end of the path is the current route, don't return a route link
    if (isLastCrumb && lastItemCurrent) return { label: name };

    const segment = ancestry.slice(0, idx + 1).join('/');
    const crumb = buildItemCrumb(segment, isLastCrumb, lastIsDirectory);
    assertFunction(Object.keys(crumb));

    return {
      label: name,
      ...crumb,
    };
  });
};
