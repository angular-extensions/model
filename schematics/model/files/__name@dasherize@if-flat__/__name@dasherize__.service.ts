import { Injectable } from '@angular/core';
import { Model, ModelFactory } from '@angular-extensions/model';
import { Observable } from 'rxjs';

const initialData: <%= classify(name) %><% if(items) { %>[]<% } %> = <% if(items) { %>[]<% } else { %>{ prop: 'value' }<% } %>;

<% if(module) { %>
@Injectable()<% } else { %>
@Injectable({
    providedIn: 'root'
})<% } %>
export class <%= classify(name) %>Service {
  private model: Model<<%= classify(name) %><% if(items) { %>[]<% } %>>;

  <%= camelize(name) %><% if(items) { %>s<% } %>$: Observable<<%= classify(name) %><% if(items) { %>[]<% } %>>;

  constructor(private modelFactory: ModelFactory<<%= classify(name) %><% if(items) { %>[]<% } %>>) {
    this.model = this.modelFactory.create(initialData);
    this.<%= camelize(name) %><% if(items) { %>s<% } %>$ = this.model.data$;
  }
<% if(items) { %>
  add<%= classify(name) %>(<%= camelize(name) %>: <%= classify(name) %>) {
    const <%= camelize(name) %>s = this.model.get();

    <%= camelize(name) %>s.push(<%= camelize(name) %>);

    this.model.set(<%= camelize(name) %>s);
  }<% } else { %>
  updateProp(newPropValue: string) {
    const <%= camelize(name) %> = this.model.get();

    <%= camelize(name) %>.prop = newPropValue;

    this.model.set(<%= camelize(name) %>);
  }<% } %>
}

export interface <%= classify(name) %> {
  prop: string;
}
