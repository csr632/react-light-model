import { Subject } from "rxjs";
import { AtomStore } from "./store";

let nextAtomInstanceId = 1;
export function getNextAtomInstanceId() {
  return nextAtomInstanceId++;
}

export function atom<State, Actions>(
  initialState: State,
  createActions: ICreateActions<State, Actions>
): IAtom<State, Actions> {
  return atomBase(initialize);

  function initialize(): IAtomInstance<State, Actions> {
    let currentValue = initialState;
    const subject = new Subject();
    const getCurrentValue = () => currentValue;
    const subscribe = (callback: any) => {
      const subscription = subject.subscribe(callback);
      return () => subscription.unsubscribe();
    };

    const actions = createActions({
      get: getCurrentValue,
      set: (updater) => {
        let nextValue: State;
        if (isFnUpdater(updater)) {
          nextValue = updater(currentValue);
        } else {
          nextValue = updater;
        }
        if (nextValue !== currentValue) {
          currentValue = nextValue;
          subject.next(null);
        }

        function isFnUpdater(v: any): v is (prev: State) => State {
          return typeof v === "function";
        }
      },
    });
    return {
      _: {
        id: getNextAtomInstanceId(),
        getCurrentValue,
        subscribe,
        actions,
        onDestroy,
      },
    };

    function onDestroy() {
      subject.complete();
    }
  }
}

export function atomBase<State, Actions>(
  initialize: (store: AtomStore) => IAtomInstance<State, Actions>
): IAtom<State, Actions> {
  // Conceptually, atomInstances lives in atomStore,
  // but in implementation,
  // atom hold reference to all its atomInstances
  // instead of store hold reference to atomInstances.
  // This is good for garbage collection:
  // When no one hold the reference to atom,
  // all atomInstances of it will be garbage-collected.
  const instances: {
    [storeId: number]: IAtomInstance<State, Actions>;
  } = {};

  return {
    _: {
      initializeForStore,
      getFromStore,
      alreadyInStore,
      deleteFromStore,
    },
  };

  function alreadyInStore({ storeId }: AtomStore) {
    return !!instances[storeId];
  }

  function initializeForStore(store: AtomStore) {
    const { storeId } = store;
    if (alreadyInStore(store)) {
      throw new Error(`atom has already been initialized in this store`);
    }
    instances[storeId] = initialize(store);
  }

  function getFromStore({ storeId }: AtomStore) {
    const instance = instances[storeId];
    if (!instance) {
      throw new Error(`atom has not been initialized in this store yet`);
    }
    return instance;
  }

  function deleteFromStore({ storeId }: AtomStore) {
    delete instances[storeId];
  }
}

export interface IAtom<State, Actions> {
  _: {
    initializeForStore: (store: AtomStore) => void;
    getFromStore: (store: AtomStore) => IAtomInstance<State, Actions>;
    alreadyInStore: (store: AtomStore) => boolean;
    deleteFromStore: (store: AtomStore) => void;
  };
}

export type ICreateActions<State, Actions> = (helpers: {
  get: () => State;
  set: ISetter<State>;
}) => Actions;

export type ISetter<State> = (
  updater: State | ((prev: State) => State)
) => void;

export interface IAtomInstance<State, Actions> {
  _: {
    id: number;
    getCurrentValue: () => State;
    subscribe: (callback: any) => () => void;
    actions: Actions;
    onDestroy?: () => void;
  };
}
