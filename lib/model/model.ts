import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

export class Model<T> {
  private _data: BehaviorSubject<T>;

  data$: Observable<T>;

  constructor(
    initialData: any,
    private immutable: boolean,
    sharedSubscription: boolean,
    private clone?: (data: T) => T
  ) {
    this._data = new BehaviorSubject(initialData);
    this.data$ = this._data.asObservable().pipe(
      map((data: T) =>
        this.immutable
          ? clone
            ? clone(data)
            : JSON.parse(JSON.stringify(data))
          : data
      ),
      sharedSubscription
        ? shareReplay({ bufferSize: 1, refCount: true })
        : map((data: T) => data)
    );
  }

  get(): T {
    const data = this._data.getValue();
    return this.immutable
      ? this.clone
        ? this.clone(data)
        : JSON.parse(JSON.stringify(data))
      : data;
  }

  set(data: T) {
    if (this.immutable) {
      const clone = this.clone
        ? this.clone(data)
        : JSON.parse(JSON.stringify(data));

      this._data.next(clone);
    } else {
      this._data.next(data);
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class ModelFactory<T> {
  create(initialData: T): Model<T> {
    return new Model<T>(initialData, true, false);
  }

  createMutable(initialData: T): Model<T> {
    return new Model<T>(initialData, false, false);
  }

  createMutableWithSharedSubscription(initialData: T): Model<T> {
    return new Model<T>(initialData, false, true);
  }

  createWithCustomClone(initialData: T, clone: (data: T) => T) {
    return new Model<T>(initialData, true, false, clone);
  }

  createWithConfig(config: {
    initialData: T;
    immutable: boolean;
    sharedSubscription: boolean;
    clone: (data: T) => T;
  }) {
    const { initialData, immutable, sharedSubscription, clone } = config;
    return new Model<T>(initialData, immutable, sharedSubscription, clone);
  }
}
