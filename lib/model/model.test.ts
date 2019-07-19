import assert from 'assert';
import sinon from 'sinon';

import { ModelFactory } from './model';

const modelFactory = new ModelFactory<TestModel>();

describe('Model', () => {
  it('should be an immutable array', () => {
    const factory: ModelFactory<TestModel[]> = new ModelFactory<TestModel[]>();

    const initial: TestModel[] = [];
    const store = factory.create(initial);

    const initialState = store.get();
    initialState.push({ value: 'updated' });

    assert.equal(store.get().length, 0);
  });

  it('should be an immutable array after set', () => {
    const factory: ModelFactory<TestModel[]> = new ModelFactory<TestModel[]>();

    const initial: TestModel[] = [];
    const store = factory.create(initial);

    const updateArray = [{ value: 'first element' }];
    store.set(updateArray);

    updateArray.push({ value: '2nd element' });
    assert.equal(store.get().length, 1);
  });

  it('should be immutable array on sub', () => {
    const factory: ModelFactory<TestModel[]> = new ModelFactory<TestModel[]>();

    const initial: TestModel[] = [];
    const store = factory.create(initial);

    const initialState = store.get();
    initialState.push({ value: 'updated' });

    store.data$.subscribe(v => {
      assert.equal(store.get().length, 0);
    });
  });

  it('should expose model data in observable', () => {
    const model = modelFactory.create({ value: 'test' });

    model.data$.subscribe(data => assert.deepEqual(data, { value: 'test' }));
  });

  it('should expose raw data getter', () => {
    const model = modelFactory.create({ value: 'test' });

    assert.deepEqual(model.get(), { value: 'test' });
  });

  it('should expose raw data setter', () => {
    const model = modelFactory.create(<TestModel>{ value: 'test' });

    model.set({ value: 'changed' });

    assert.deepEqual(model.get(), { value: 'changed' });
  });

  it('should use immutable data in exposed observable by default', () => {
    const model = modelFactory.create({ value: 'test' });

    model.data$.subscribe(data => {
      data.value = 'changed';
      assert.deepEqual(model.get(), { value: 'test' });
    });
  });

  it('should use mutable data in exposed observable when configured', () => {
    const model = modelFactory.createMutable({ value: 'test' });

    model.data$.subscribe(data => {
      data.value = 'changed';
      assert.deepEqual(model.get(), { value: 'changed' });
    });
  });

  it('should use custom clone function when configured', () => {
    const cloneSpy = sinon.spy();
    const model = modelFactory.createWithCustomClone(
      { value: 'test' },
      cloneSpy
    );

    model.data$.subscribe(() => {
      sinon.assert.calledOnce(cloneSpy);
      sinon.assert.calledWith(cloneSpy, { value: 'test' });
    });
  });

  it('should create multiple independent instances', () => {
    const model1 = modelFactory.create({ value: 'test1' });
    const model2 = modelFactory.create({ value: 'test2' });

    model2.set({ value: 'changed' });

    model1.data$.subscribe(data => assert.deepEqual(data, { value: 'test1' }));
    model2.data$.subscribe(data =>
      assert.deepEqual(data, { value: 'changed' })
    );
  });

  it('should not share subscription by default', () => {
    const model = modelFactory.create({ value: 'test' });

    model.data$.subscribe(data => {
      data.value = 'changed';
      assert.deepEqual(data, { value: 'changed' });
    });
    model.data$.subscribe(data => {
      assert.deepEqual(data, { value: 'test' });
    });
  });

  it('should share subscription when configured', () => {
    const model = modelFactory.createMutableWithSharedSubscription({
      value: 'test'
    });

    model.data$.subscribe(data => {
      data.value = 'changed';
      assert.deepEqual(data, { value: 'changed' });
    });
    model.data$.subscribe(data => {
      assert.deepEqual(data, { value: 'changed' });
    });
  });
});

interface TestModel {
  value: string;
}
