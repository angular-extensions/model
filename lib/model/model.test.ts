import assert from 'assert';
import sinon from 'sinon';

import { ModelFactory } from './model';

const modelFactory = new ModelFactory<TestModel>();

describe('Model', () => {
  it('should expose model data in observable', () => {
    const model = modelFactory.create({ value: 'test' });

    model.data$.subscribe(data =>
      assert.deepStrictEqual(data, { value: 'test' })
    );
  });

  it('should expose raw data getter', () => {
    const model = modelFactory.create({ value: 'test' });

    assert.deepStrictEqual(model.get(), { value: 'test' });
  });

  it('should expose raw data setter', () => {
    const model = modelFactory.create(<TestModel>{ value: 'test' });

    model.set({ value: 'changed' });

    assert.deepStrictEqual(model.get(), { value: 'changed' });
  });

  it('should use immutable data in exposed observable by default', () => {
    const model = modelFactory.create({ value: 'test' });

    model.data$.subscribe(data => {
      data.value = 'changed';
      assert.deepStrictEqual(model.get(), { value: 'test' });
    });
  });

  it('should use immutable data in model by default (get)', () => {
    const model = modelFactory.create({ value: 'test' });

    const modelData = model.get();
    modelData.value = 'changed';

    model.data$.subscribe(data => {
      assert.deepStrictEqual(data, { value: 'test' });
    });
  });

  it('should use immutable data in model by default (set)', () => {
    const model = modelFactory.create({ value: 'test' });

    const changedData = { value: 'changed' };
    model.set(changedData);

    changedData.value = 'changed even more';

    model.data$.subscribe(data => {
      assert.deepStrictEqual(data, { value: 'changed' });
    });
  });

  it('should use mutable data in exposed observable when configured', () => {
    const model = modelFactory.createMutable({ value: 'test' });

    model.data$.subscribe(data => {
      data.value = 'changed';
      assert.deepStrictEqual(model.get(), { value: 'changed' });
    });
  });

  it('should use mutable data in model (get) when configured', () => {
    const model = modelFactory.createMutable({ value: 'test' });

    const modelData = model.get();
    modelData.value = 'changed';

    model.data$.subscribe(data => {
      assert.deepStrictEqual(data, { value: 'changed' });
    });
  });

  it('should use mutable data in model (set) when configured', () => {
    const model = modelFactory.createMutable({ value: 'test' });

    const changedData = { value: 'changed' };
    model.set(changedData);

    changedData.value = 'changed even more';

    model.data$.subscribe(data => {
      assert.deepStrictEqual(data, { value: 'changed even more' });
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

  it('should use custom clone function when configured (get)', () => {
    const cloneSpy = sinon.spy();
    const model = modelFactory.createWithCustomClone(
      { value: 'test' },
      cloneSpy
    );

    model.get();
    sinon.assert.calledOnce(cloneSpy);
    sinon.assert.calledWith(cloneSpy, { value: 'test' });
  });

  it('should use custom clone function when configured (set)', () => {
    const cloneSpy = sinon.spy();
    const model = modelFactory.createWithCustomClone(
      { value: 'test' },
      cloneSpy
    );

    model.set({ value: 'changed' });
    sinon.assert.calledOnce(cloneSpy);
    sinon.assert.calledWith(cloneSpy, { value: 'changed' });
  });

  it('should create multiple independent instances', () => {
    const model1 = modelFactory.create({ value: 'test1' });
    const model2 = modelFactory.create({ value: 'test2' });

    model2.set({ value: 'changed' });

    model1.data$.subscribe(data =>
      assert.deepStrictEqual(data, { value: 'test1' })
    );
    model2.data$.subscribe(data =>
      assert.deepStrictEqual(data, { value: 'changed' })
    );
  });

  it('should not share subscription by default', () => {
    const model = modelFactory.create({ value: 'test' });

    model.data$.subscribe(data => {
      data.value = 'changed';
      assert.deepStrictEqual(data, { value: 'changed' });
    });
    model.data$.subscribe(data => {
      assert.deepStrictEqual(data, { value: 'test' });
    });
  });

  it('should share subscription when configured', () => {
    const model = modelFactory.createMutableWithSharedSubscription({
      value: 'test'
    });

    model.data$.subscribe(data => {
      data.value = 'changed';
      assert.deepStrictEqual(data, { value: 'changed' });
    });
    model.data$.subscribe(data => {
      assert.deepStrictEqual(data, { value: 'changed' });
    });
  });
});

interface TestModel {
  value: string;
}
