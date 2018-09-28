import assert from 'assert';
import path from 'path';
import {
  SchematicTestRunner,
  UnitTestTree
} from '@angular-devkit/schematics/testing';
import { Schema as ApplicationOptions } from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';

import packageJson from '../../package.json';

import { Schema as NgAddOptions } from './schema';

const workspaceOptions: WorkspaceOptions = {
  name: 'workspace',
  newProjectRoot: 'projects',
  version: '6.0.0'
};

const appOptions: ApplicationOptions = {
  name: 'bar',
  inlineStyle: false,
  inlineTemplate: false,
  routing: false,
  style: 'css',
  skipTests: false,
  skipPackageJson: false
};

const defaultOptions: NgAddOptions = {
  skipInstall: false
};

const collectionPath = path.join(__dirname, '../collection.json');
const runner = new SchematicTestRunner('schematics', collectionPath);
const version = packageJson.version;

let appTree: UnitTestTree;

describe('Schematic: ng-add', () => {
  beforeEach(() => {
    appTree = runner.runExternalSchematic(
      '@schematics/angular',
      'workspace',
      workspaceOptions
    );
    appTree = runner.runExternalSchematic(
      '@schematics/angular',
      'application',
      appOptions,
      appTree
    );
  });

  it('should add @angular-extensions/model to dependencies in package.json', () => {
    const options = { ...defaultOptions };

    const tree = runner.runSchematic('ng-add', options, appTree);
    const content = tree.readContent('/package.json');
    const contentAsObject = JSON.parse(content);
    assert.equal(runner.tasks.length, 1);
    assert(content.includes(`"@angular-extensions/model": "^${version}"`));
    assert.equal(
      contentAsObject.dependencies['@angular-extensions/model'],
      `^${version}`
    );
  });

  it('should respect skipInstall flag', () => {
    const options = { ...defaultOptions, skipInstall: true };

    const tree = runner.runSchematic('ng-add', options, appTree);
    assert.equal(runner.tasks.length, 0);
  });
});
