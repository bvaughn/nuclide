'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ImportDefaultSpecifier} from 'ast-types-flow';
import type {Lines, Print} from '../../types/common';

import flatten from '../../utils/flatten';

function printImportDefaultSpecifier(
  print: Print,
  node: ImportDefaultSpecifier,
): Lines {
  return flatten(print(node.local));
}

module.exports = printImportDefaultSpecifier;
