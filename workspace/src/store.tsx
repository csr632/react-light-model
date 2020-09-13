// we should use useMutableSource instead of use-subscription
// useMutableSource is still in react@experimental

import React, { useRef, useMemo, useContext, useState, useEffect } from "react";
import { useSubscription } from "use-subscription";
import type { IAtom, IAtomInstance } from "./atom";

export interface IAtomStore {
  useAtomValue: <State, Actions>(atom: IAtom<State, Actions>) => State;
  Provider: React.FC<{}>;
  useAtomActions: <State, Actions>(atom: IAtom<State, Actions>) => Actions;
  useAtom<State, Actions>(
    atom: IAtom<State, Actions>
  ): readonly [State, Actions];
  withProvider: <Props extends unknown>(
    Wrapped: React.ComponentType<Props>
  ) => React.FC<Props>;
}

let nextStoreId = 1;

export function createAtomStore(): IAtomStore {
  const storeCtx = React.createContext(
    (null as unknown) as {
      get: <State, Actions>(
        atom: IAtom<State, Actions>
      ) => IAtomInstance<State, Actions>;
    }
  );

  const Provider: React.FC = ({ children }) => {
    const [storeId] = useState(() => nextStoreId++);
    const atoms = useRef<IAtom<any, any>[]>([]);

    const store = useMemo(() => {
      return {
        get: <State, Actions>(atom: IAtom<State, Actions>) => {
          if (!atom._.alreadyInStore(storeId)) atoms.current.push(atom);
          return atom._.getFromStore(storeId);
        },
      };
    }, []);

    useEffect(() => {
      // When the store component is unmounted.
      // All atomInstances in it should be garbage-collected.
      atoms.current.forEach((atom) => {
        atom._.deleteFromStore(storeId);
      });
    }, []);

    return <storeCtx.Provider value={store}>{children}</storeCtx.Provider>;
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
    const atomValue: State = useSubscription({
      getCurrentValue: atomInstance._.getCurrentValue,
      subscribe: atomInstance._.subscribe,
    });
    return atomValue;
  }

  function useAtomActions<State, Actions>(atom: IAtom<State, Actions>) {
    const atomInstance = useAtomInstance(atom);
    return atomInstance._.actions;
  }

  function useAtom<State, Actions>(atom: IAtom<State, Actions>) {
    return [useAtomValue(atom), useAtomActions(atom)] as const;
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

  return { Provider, withProvider, useAtomValue, useAtomActions, useAtom };
}

function createSingletonAtomStore() {}

// function derived() {}
