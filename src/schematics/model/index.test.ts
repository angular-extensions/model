import assert from 'assert';
import path from 'path';
import {
  SchematicTestRunner,
  UnitTestTree
} from '@angular-devkit/schematics/testing';
import { Schema as ApplicationOptions } from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import { Schema as ModelOptions } from './schema';

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

const defaultOptions: ModelOptions = {
  name: 'foo',
  spec: true,
  flat: false,
  project: 'bar'
};

const collectionPath = path.join(__dirname, '../collection.json');
const runner = new SchematicTestRunner('schematics', collectionPath);

let appTree: UnitTestTree;

describe('Schematic: Model', () => {
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

  it('should create a model service', () => {
    const options = { ...defaultOptions };

    const tree = runner.runSchematic('model', options, appTree);
    assert(tree.files.includes('/projects/bar/src/app/foo/foo.service.ts'));
    assert(
      tree.files.includes('/projects/bar/src/app/foo/foo.service.spec.ts')
    );
  });

  it('should create a model service respecting path as part of name', () => {
    const options = { ...defaultOptions, name: 'path/foo' };

    const tree = runner.runSchematic('model', options, appTree);
    assert(
      tree.files.includes('/projects/bar/src/app/path/foo/foo.service.ts')
    );
    assert(
      tree.files.includes('/projects/bar/src/app/path/foo/foo.service.spec.ts')
    );
  });

  it('should create a model service respecting path as param', () => {
    const options = { ...defaultOptions, name: 'foo', path: 'path' };

    const tree = runner.runSchematic('model', options, appTree);
    assert(tree.files.includes('/path/foo/foo.service.ts'));
    assert(tree.files.includes('/path/foo/foo.service.spec.ts'));
  });

  it('should respect the flat flag', () => {
    const options = { ...defaultOptions, flat: true };

    const tree = runner.runSchematic('model', options, appTree);
    assert(tree.files.includes('/projects/bar/src/app/foo.service.ts'));
    assert(tree.files.includes('/projects/bar/src/app/foo.service.spec.ts'));
  });

  it('should respect the spec flag', () => {
    const options = { ...defaultOptions, spec: false };

    const tree = runner.runSchematic('model', options, appTree);
    assert(tree.files.includes('/projects/bar/src/app/foo/foo.service.ts'));
    assert(
      !tree.files.includes('/projects/bar/src/app/foo/foo.service.spec.ts')
    );
  });

  it('should respect the sourceRoot value', () => {
    const config = JSON.parse(appTree.readContent('/angular.json'));
    config.projects.bar.sourceRoot = 'projects/bar/custom';
    appTree.overwrite('/angular.json', JSON.stringify(config, null, 2));
    const tree = runner.runSchematic('model', defaultOptions, appTree);
    assert(tree.files.includes('/projects/bar/custom/app/foo/foo.service.ts'));
  });

  it('should be tree-shakeable if no module is set', () => {
    const options = { ...defaultOptions };

    const tree = runner.runSchematic('model', options, appTree);
    const content = tree.readContent(
      '/projects/bar/src/app/foo/foo.service.ts'
    );
    assert(content.includes(`providedIn: 'root'`));
  });

  it('should not be tree-shakeable if module is set', () => {
    const options = { ...defaultOptions, module: '/app.module.ts' };

    const tree = runner.runSchematic('model', options, appTree);
    const content = tree.readContent(
      '/projects/bar/src/app/foo/foo.service.ts'
    );
    assert(!content.includes(`providedIn: 'root'`));
  });

  it('should create model interface', () => {
    const options = { ...defaultOptions };

    const tree = runner.runSchematic('model', options, appTree);
    const content = tree.readContent(
      '/projects/bar/src/app/foo/foo.service.ts'
    );
    assert(/interface Foo {\n  prop: string;\n}/.test(content));
  });

  it('should create model collection with items flag', () => {
    const options = { ...defaultOptions, items: true };

    const tree = runner.runSchematic('model', options, appTree);
    const content = tree.readContent(
      '/projects/bar/src/app/foo/foo.service.ts'
    );
    assert(content.includes('private model: Model<Foo[]>;'));
  });

  it('should not be provided by default', () => {
    const options = { ...defaultOptions };

    const tree = runner.runSchematic('model', options, appTree);
    const content = tree.readContent('/projects/bar/src/app/app.module.ts');
    assert(!content.includes(`import { FooService } from './foo/foo.service'`));
  });

  it('should import into a specified module', () => {
    const options = { ...defaultOptions, module: 'app.module.ts' };

    const tree = runner.runSchematic('model', options, appTree);
    const content = tree.readContent('/projects/bar/src/app/app.module.ts');
    assert(content.includes(`import { FooService } from './foo/foo.service'`));
  });

  it('should fail if specified module does not exist', () => {
    const options = { ...defaultOptions, module: 'app.moduleXXX.ts' };
    let thrownError: Error | null = null;
    try {
      runner.runSchematic('model', options, appTree);
    } catch (err) {
      thrownError = err;
    }
    assert(thrownError);
  });
});
