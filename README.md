# The Angular Model - @angular-extensions/model

by [@tomastrajan](https://twitter.com/tomastrajan)

[![npm](https://img.shields.io/npm/v/@angular-extensions/model.svg)](https://www.npmjs.com/package/@angular-extensions/model) [![npm](https://img.shields.io/npm/l/@angular-extensions/model.svg)](https://github.com/@angular-extensions/model/blob/master/LICENSE) [![npm](https://img.shields.io/npm/dm/@angular-extensions/model.svg)](https://www.npmjs.com/package/@angular-extensions/model) [![Build Status](https://travis-ci.org/@angular-extensions/model.svg?branch=master)](https://travis-ci.org/@angular-extensions/model) [![Twitter Follow](https://img.shields.io/twitter/follow/tomastrajan.svg?style=social&label=Follow)](https://twitter.com/tomastrajan)

Simple state management with minimalistic API, one way data flow,
multiple model support and immutable data exposed as RxJS Observable.

## Documentation

- [StackBlitz Demo](https://stackblitz.com/github/tomastrajan/ngx-model-example)
- [Demo & Documentation](http://tomastrajan.github.io/angular-model-pattern-example/)
- [Blog Post](https://medium.com/@tomastrajan/model-pattern-for-angular-state-management-6cb4f0bfed87)
- [Changelog](https://github.com/@angular-extensions/model/blob/master/CHANGELOG.md)

![@angular-extensions/model dataflow diagram](https://raw.githubusercontent.com/tomastrajan/angular-model-pattern-example/master/src/assets/model_graph.png 'ngx-model dataflow diagram')

## Getting started

1.  Install `@angular-extensions/model`

    ```
    npm install --save @angular-extensions/model
    ```

    or

    ```
    yarn add @angular-extensions/model
    ```

    or

    ```
    ng add @angular-extensions/model
    ```

2.  Import and use `ModelModule` in you `AppModule` (or `CoreModule`)

    ```ts
    import { ModelModule } from '@angular-extensions/model';

    @NgModule({
      imports: [NgxModelModule]
    })
    export class CoreModule {}
    ```

3.  Import and use `Model` and `ModelFactory` in your own services.

    ```ts
    import { Injectable } from '@angular/core';
    import { Observable } from 'rxjs';
    import { ModelFactory, Model } from '@angular-extensions/model';

    @Injectable()
    export class TodosService {
      private model: Model<Todo[]>;

      todos$: Observable<Todo[]>;

      constructor(private modelFactory: ModelFactory<Todo[]>) {
        this.model = this.modelFactory.create([]); // create model and pass initial data
        this.todos$ = this.model.data$; // expose model data as named public property
      }

      toggleTodo(id: string) {
        // retrieve raw model data
        const todos = this.model.get();

        // mutate model data
        todos.forEach(t => {
          if (t.id === id) {
            t.done = !t.done;
          }
        });

        // set new model data (after mutation)
        this.model.set(todos);
      }
    }
    ```

4.  Use service in your component. Import and inject service into components constructor.
    Subscribe to services data in template `todosService.todos$ | async`
    or explicitly `this.todosService.todos$.subscribe(todos => { /* ... */ })`

        ```ts
        import { Component, OnInit, OnDestroy } from '@angular/core';
        import { Subject } from 'rxjs';

        import { TodosService, Todo } from './todos.service';

        @Component({
          selector: 'model-todos',
          templateUrl: `
            /* ... */
            <h1>Todos ({{count}})</h1>
            <ul>
              <!-- template subscription to todos using async pipe -->
              <li *ngFor="let todo of todosService.todos$ | async" (click)="onTodoClick(todo)">
                {{todo.name}}
              </li>
            </ul>
          `,
        })
        export class TodosComponent implements OnInit, OnDestroy {

          private unsubscribe$: Subject<void> = new Subject<void>();

          count: number;

          constructor(public todosService: TodosService) {}

          ngOnInit() {
            // explicit subscription to todos to get count
            this.todosService.todos
              .pipe(
                takeUntil(this.unsubscribe$) // declarative unsubscription
              )
              .subscribe(todos => this.count = todos.length);
          }

          ngOnDestroy(): void {
            // for declarative unsubscription
            this.unsubscribe$.next();
            this.unsubscribe$.complete();
          }

          onTodoClick(todo: Todo) {
            this.todosService.toggleTodo(todo.id);
          }

        }

        ```

## Available Model Factories

Models are created using model factory as shown in above example `this.model = this.modelFactory.create([]);`.
Multiple model factories are provided out of the box to support different use cases:

- `create(initialData: T): Model<T>` - create basic model which is immutable by default (`JSON` cloning)
- `createMutable(initialData: T): Model<T>` - create model with no immutability guarantees (you have to make sure that model consumers don't mutate and corrupt model state) but much more performance because whole cloning step is skipped
- `createMutableWithSharedSubscription(initialData: T): Model<T>` - gain even more performance by skipping both immutability and sharing subscription between all consumers (eg situation in which many components are subscribed to single model)
- `createWithCustomClone(initialData: T, clone: (data: T) => T)` - create immutable model by passing your custom clone function (`JSON` cloning doesn't support properties containing function or regex so custom cloning functionality might be needed)

## Relationship to Angular Model Pattern

This is a library version of [Angular Model Pattern](https://tomastrajan.github.io/angular-model-pattern-example).
All the original examples and documentation are still valid. The only difference is that
you can install `@angular-extensions/model` from npm instead of having to copy model pattern
implementation to your project manually.

Check out the [Blog Post](https://medium.com/@tomastrajan/model-pattern-for-angular-state-management-6cb4f0bfed87) and
[Advanced Usage Patterns](https://tomastrajan.github.io/angular-model-pattern-example#/advanced)
for more how-tos and examples.

## Getting started with Schematics

TODO
