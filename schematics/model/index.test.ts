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
  style: Style.Css,
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

  it('should create a model service', async () => {
    const options = { ...defaultOptions };

    const tree = await runner
      .runSchematicAsync('model', options, appTree)
      .toPromise();
    assert(tree.files.includes('/projects/bar/src/app/foo/foo.service.ts'));
    assert(
      tree.files.includes('/projects/bar/src/app/foo/foo.service.spec.ts')
    );
  });

  it('should create a model service in first project if no project was provided', async () => {
    const options = { ...defaultOptions, project: undefined };

    const tree = await runner
      .runSchematicAsync('model', options, appTree)
      .toPromise();
    assert(tree.files.includes('/projects/bar/src/app/foo/foo.service.ts'));
    assert(
      tree.files.includes('/projects/bar/src/app/foo/foo.service.spec.ts')
    );
  });

  it('should create a model service respecting path as part of name', async () => {
    const options = { ...defaultOptions, name: 'path/foo' };

    const tree = await runner
      .runSchematicAsync('model', options, appTree)
      .toPromise();
    assert(
      tree.files.includes('/projects/bar/src/app/path/foo/foo.service.ts')
    );
    assert(
      tree.files.includes('/projects/bar/src/app/path/foo/foo.service.spec.ts')
    );
  });

  it('should create a model service respecting path as param', async () => {
    const options = { ...defaultOptions, name: 'foo', path: 'path' };

    const tree = await runner
      .runSchematicAsync('model', options, appTree)
      .toPromise();
    assert(tree.files.includes('/path/foo/foo.service.ts'));
    assert(tree.files.includes('/path/foo/foo.service.spec.ts'));
  });

  it('should respect the flat flag', async () => {
    const options = { ...defaultOptions, flat: true };

    const tree = await runner
      .runSchematicAsync('model', options, appTree)
      .toPromise();
    assert(tree.files.includes('/projects/bar/src/app/foo.service.ts'));
    assert(tree.files.includes('/projects/bar/src/app/foo.service.spec.ts'));
  });

  it('should respect the spec flag', async () => {
    const options = { ...defaultOptions, spec: false };

    const tree = await runner
      .runSchematicAsync('model', options, appTree)
      .toPromise();
    assert(tree.files.includes('/projects/bar/src/app/foo/foo.service.ts'));
    assert(
      !tree.files.includes('/projects/bar/src/app/foo/foo.service.spec.ts')
    );
  });

  it('should respect the sourceRoot value', async () => {
    const config = JSON.parse(appTree.readContent('/angular.json'));
    config.projects.bar.sourceRoot = 'projects/bar/custom';
    appTree.overwrite('/angular.json', JSON.stringify(config, null, 2));
    const tree = await runner
      .runSchematicAsync('model', defaultOptions, appTree)
      .toPromise();
    assert(tree.files.includes('/projects/bar/custom/app/foo/foo.service.ts'));
  });

  it('should be tree-shakeable if no module is set', async () => {
    const options = { ...defaultOptions };

    const tree = await runner
      .runSchematicAsync('model', options, appTree)
      .toPromise();
    const content = tree.readContent(
      '/projects/bar/src/app/foo/foo.service.ts'
    );
    assert(content.includes(`providedIn: 'root'`));
  });

  it('should not be tree-shakeable if module is set', async () => {
    const options = { ...defaultOptions, module: '/app.module.ts' };

    const tree = await runner
      .runSchematicAsync('model', options, appTree)
      .toPromise();
    const content = tree.readContent(
      '/projects/bar/src/app/foo/foo.service.ts'
    );
    assert(!content.includes(`providedIn: 'root'`));
  });

  it('should create model interface', async () => {
    const options = { ...defaultOptions };

    const tree = await runner
      .runSchematicAsync('model', options, appTree)
      .toPromise();
    const content = tree.readContent(
      '/projects/bar/src/app/foo/foo.service.ts'
    );
    assert(/interface Foo {\n  prop: string;\n}/.test(content));
  });

  it('should create model collection with items flag', async () => {
    const options = { ...defaultOptions, items: true };

    const tree = await runner
      .runSchematicAsync('model', options, appTree)
      .toPromise();
    const content = tree.readContent(
      '/projects/bar/src/app/foo/foo.service.ts'
    );
    assert(content.includes('private model: Model<Foo[]>;'));
  });

  it('should not be provided by default', async () => {
    const options = { ...defaultOptions };

    const tree = await runner
      .runSchematicAsync('model', options, appTree)
      .toPromise();
    const content = tree.readContent('/projects/bar/src/app/app.module.ts');
    assert(!content.includes(`import { FooService } from './foo/foo.service'`));
  });

  it('should import into a specified module', async () => {
    const options = { ...defaultOptions, module: 'app.module.ts' };

    const tree = await runner
      .runSchematicAsync('model', options, appTree)
      .toPromise();
    const content = tree.readContent('/projects/bar/src/app/app.module.ts');
    assert(content.includes(`import { FooService } from './foo/foo.service'`));
  });

  it('should fail if specified module does not exist', async () => {
    const options = { ...defaultOptions, module: 'app.moduleXXX.ts' };
    let thrownError: Error | null = null;
    try {
      await runner.runSchematicAsync('model', options, appTree).toPromise();
    } catch (err) {
      thrownError = err;
    }
    assert(thrownError);
  });
});
