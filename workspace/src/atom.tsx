import { BehaviorSubject } from "rxjs";

export function atom<State, Actions>(
  initialState: State,
  createActions: ICreateActions<State, Actions>
): IAtom<State, Actions> {
  const instances: {
    [storeId: number]: IAtomInstance<State, Actions>;
  } = {};

  return {
    _: {
      // initialize,
      getFromStore,
      alreadyInStore,
      deleteFromStore,
    },
  };

  function alreadyInStore(storeId: number) {
    return !!instances[storeId];
  }

  function getFromStore(storeId: number) {
    let instance = instances[storeId];
    if (!instance) {
      instance = instances[storeId] = initialize();
    }
    return instance;
  }

  function deleteFromStore(storeId: number) {
    delete instances[storeId];
  }

  function initialize(): IAtomInstance<State, Actions> {
    const subject = new BehaviorSubject(initialState);
    const getCurrentValue = () => subject.getValue();
    const subscribe = (callback: any) => {
      const subscription = subject.subscribe(callback);
      return () => subscription.unsubscribe();
    };

    const actions = createActions({
      get: getCurrentValue,
      set: (updater) => {
        const currentValue = subject.getValue();
        let nextValue: State;
        if (isFnUpdater(updater)) {
          nextValue = updater(currentValue);
        } else {
          nextValue = updater;
        }
        if (nextValue !== currentValue) subject.next(nextValue);

        function isFnUpdater(v: any): v is (prev: State) => State {
          return typeof v === "function";
        }
      },
    });
    return { _: { getCurrentValue, subscribe, actions } };
  }
}

export interface IAtom<State, Actions> {
  _: {
    getFromStore: (storeId: number) => IAtomInstance<State, Actions>;
    alreadyInStore: (storeId: number) => boolean;
    deleteFromStore: (storeId: number) => void;
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
    getCurrentValue: () => State;
    subscribe: (callback: any) => () => void;
    actions: Actions;
  };
}
