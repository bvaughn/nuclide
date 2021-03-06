/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {Directory} from '../../nuclide-remote-connection';

import {CwdApi} from './CwdApi';
import {CompositeDisposable} from 'atom';
import {getAtomProjectRootPath} from 'nuclide-commons-atom/projects';

export class Activation {
  _cwdApi: CwdApi;
  _disposables: CompositeDisposable;
  _lastWorkingRootPath: ?string;
  _currentWorkingRootDirectory: ?Directory;

  constructor(rawState: ?Object) {
    const state = rawState || {};
    const {initialCwdPath} = state;
    this._cwdApi = new CwdApi(initialCwdPath);
    this._currentWorkingRootDirectory = this._cwdApi.getCwd();
    this._disposables = new CompositeDisposable(
      this._cwdApi,
      atom.commands.add(
        'atom-workspace',
        'nuclide-current-working-root:set-from-active-file',
        this._setFromActiveFile.bind(this),
      ),
      atom.commands.add(
        'atom-workspace',
        'nuclide-current-working-root:switch-to-previous',
        this._switchToLastWorkingRoot.bind(this),
      ),
      this._cwdApi.observeCwd(newCwd => {
        if (this._currentWorkingRootDirectory != null) {
          const oldCwd = this._currentWorkingRootDirectory.getPath();
          if (newCwd === oldCwd) {
            return;
          }
          this._lastWorkingRootPath = oldCwd;
        }
        this._currentWorkingRootDirectory = newCwd;
      }),
    );
  }

  dispose(): void {
    this._disposables.dispose();
  }

  provideApi(): CwdApi {
    return this._cwdApi;
  }

  serialize(): Object {
    const cwd = this._cwdApi.getCwd();
    return {
      initialCwdPath: cwd == null ? null : cwd.getPath(),
    };
  }

  _switchToLastWorkingRoot(): void {
    if (this._lastWorkingRootPath != null) {
      this._cwdApi.setCwd(this._lastWorkingRootPath);
    }
  }

  _setFromActiveFile(): void {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor == null) {
      atom.notifications.addError('No file is currently active.');
      return;
    }

    const path = editor.getPath();
    if (path == null) {
      atom.notifications.addError('Active file does not have a path.');
      return;
    }

    const projectRoot = getAtomProjectRootPath(path);
    if (projectRoot == null) {
      atom.notifications.addError('Active file does not belong to a project.');
      return;
    }

    this._cwdApi.setCwd(projectRoot);
  }
}
