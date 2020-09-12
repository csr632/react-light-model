// we should use useMutableSource instead of use-subscription
// useMutableSource is still in react@experimental

import React, { useCallback, useRef, useMemo, useContext } from "react";
import { BehaviorSubject } from "rxjs";
import { useSubscription } from "use-subscription";

export interface IAtom<State, Actions> {
  _: {
    atomId: symbol;
    initialState: State;
    createActions: ICreateActions<State, Actions>;
  };
}

export type ISetter<State> = (
  updater: State | ((prev: State) => State)
) => void;

export type ICreateActions<State, Actions> = (helpers: {
  get: () => State;
  set: ISetter<State>;
}) => Actions;

export function atom<State, Actions>(
  initialState: State,
  createActions: ICreateActions<State, Actions>
): IAtom<State, Actions> {
  return {
    _: {
      atomId: Symbol(),
      initialState,
      createActions,
    },
  };
}

export interface IAtomStore {
  useAtomValue: <State, Actions>(atom: IAtom<State, Actions>) => any;
  Provider: React.FC<{}>;
  withProvider: <Props extends unknown>(
    Wrapped: React.ComponentType<Props>
  ) => React.FC<Props>;
  useAtomActions: <State, Actions>(atom: IAtom<State, Actions>) => Actions;
}

export interface IAtomInstance<State, Actions> {
  _: {
    subject: BehaviorSubject<State>;
    source: any;
    actions: Actions;
  };
}

export function createAtomStore(): IAtomStore {
  const storeCtx = React.createContext(
    (null as unknown) as {
      get: <State, Actions>(
        atom: IAtom<State, Actions>
      ) => IAtomInstance<State, Actions>;
    }
  );

  const Provider: React.FC = ({ children }) => {
    const atomInstances = useRef<{ [atomId: string]: IAtomInstance<any, any> }>(
      {}
    );

    const get = useCallback(<State, Actions>(atom: IAtom<State, Actions>) => {
      let atomInstance: IAtomInstance<State, Actions> =
        atomInstances.current[(atom._.atomId as unknown) as string];
      if (!atomInstance)
        atomInstance = atomInstances.current[
          (atom._.atomId as unknown) as string
        ] = createAtomInstance(atom);
      return atomInstance;
    }, []);

    const store = useMemo(() => {
      return {
        get,
      };
    }, [get]);

    return <storeCtx.Provider value={store}>{children}</storeCtx.Provider>;

    function createAtomInstance<State, Actions>(
      atom: IAtom<State, Actions>
    ): IAtomInstance<State, Actions> {
      const subject = new BehaviorSubject(atom._.initialState);
      // const source = createMutableSource(subject, () => subject.getValue());
      const source = {
        getCurrentValue: () => subject.getValue(),
        subscribe: (callback: any) => {
          const subscription = subject.subscribe(callback);
          return () => subscription.unsubscribe();
        },
      };
      const actions = atom._.createActions({
        get: () => subject.getValue(),
        set: (updater) => {
          let nextValue: State;
          if (isFnUpdater(updater)) {
            nextValue = updater(subject.getValue());
          } else {
            nextValue = updater;
          }
          subject.next(nextValue);

          function isFnUpdater(v: any): v is (prev: State) => State {
            return typeof v === "function";
          }
        },
      });
      return { _: { subject, source, actions } };
    }
  };

  const withProvider = <Props extends any>(
    Wrapped: React.ComponentType<Props>
  ): React.FC<Props> => {
    const HOC: React.FC<Props> = (props) => (
      <Provider>
        <Wrapped {...props} />
      </Provider>
    );
    return HOC;
  };

  function useAtomValue<State, Actions>(atom: IAtom<State, Actions>) {
    const atomInstance = useAtomInstance(atom);
    const atomValue = useSubscription(atomInstance._.source);
    return atomValue;
  }

  function useAtomActions<State, Actions>(atom: IAtom<State, Actions>) {
    const atomInstance = useAtomInstance(atom);
    return atomInstance._.actions;
  }

  function useAtomInstance<State, Actions>(atom: IAtom<State, Actions>) {
    const ctxValue = useContext(storeCtx);
    if (!ctxValue) {
      throw new Error(
        `Unable to find store. Atom should be used under the store's <Provider>`
      );
    }
    const atomInstance = ctxValue.get(atom);
    return atomInstance;
  }

  return { Provider, withProvider, useAtomValue, useAtomActions };
}

function createSingletonAtomStore() {}

// function derived() {}
