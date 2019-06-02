import assert from 'assert';
import path from 'path';
import {
  SchematicTestRunner,
  UnitTestTree
} from '@angular-devkit/schematics/testing';
import {
  Schema as ApplicationOptions,
  Style
} from '@schematics/angular/application/schema';
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
  style: Style.Css,
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
  beforeEach(async () => {
    appTree = await runner
      .runExternalSchematicAsync(
        '@schematics/angular',
        'workspace',
        workspaceOptions
      )
      .toPromise();
    appTree = await runner
      .runExternalSchematicAsync(
        '@schematics/angular',
        'application',
        appOptions,
        appTree
      )
      .toPromise();
  });

  it('should add @angular-extensions/model to dependencies in package.json', async () => {
    const options = { ...defaultOptions };

    const tree = await runner
      .runSchematicAsync('ng-add', options, appTree)
      .toPromise();
    const content = tree.readContent('/package.json');
    const contentAsObject = JSON.parse(content);
    assert.strictEqual(runner.tasks.length, 1);
    assert(content.includes(`"@angular-extensions/model": "^${version}"`));
    assert.strictEqual(
      contentAsObject.dependencies['@angular-extensions/model'],
      `^${version}`
    );
  });

  it('should respect skipInstall flag', async () => {
    const options = { ...defaultOptions, skipInstall: true };

    runner.runSchematicAsync('ng-add', options, appTree);
    assert.strictEqual(runner.tasks.length, 0);
  });
});
