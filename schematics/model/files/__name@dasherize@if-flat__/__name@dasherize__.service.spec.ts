import { TestBed, inject, waitForAsync } from '@angular/core/testing';

import { <%= classify(name) %>Service } from './<%= dasherize(name) %>.service';

describe('<%= classify(name) %>Service', () => {
  beforeEach(() => {
    TestBed.configureTestingModule(<% if(module) { %>{
      providers: [<%= classify(name) %>Service]
    }<% } else { %>{}<% } %>);
  });

  it('should be created',
    inject([<%= classify(name) %>Service], (service: <%= classify(name) %>Service) => {
      expect(service).toBeTruthy();
    })
  );
<% if(items) { %>
  it('should add item',
    waitForAsync(
      inject([<%= classify(name) %>Service], (service: <%= classify(name) %>Service) => {
        service.add<%= classify(name) %>({ prop: 'test' });
        service.<%= camelize(name) %>s$.subscribe(<%= camelize(name) %>s => expect(<%= camelize(name) %>s.length).toBe(1));
      })
    )
  );<% } else { %>
  it('should update prop',
    waitForAsync(
        inject([<%= classify(name) %>Service], (service: <%= classify(name) %>Service) => {
          service.updateProp('changed');
          service.<%= camelize(name) %>$.subscribe(<%= camelize(name) %> => expect(<%= camelize(name) %>.prop).toBe('changed'));
      })
    )
  );<% } %>
});
