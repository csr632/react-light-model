import React, { useContext, useState, useEffect, useMemo } from "react";
import us from "use-subscription";

import { AtomStore } from "../store";
import type { IAtom } from "../atom";

export function createStore(): IReactStore {
  const storeCtx = React.createContext<AtomStore | null>(null);

  function withProvider<Props extends any>(
    Wrapped: React.ComponentType<Props>
  ): React.FC<Props>;
  function withProvider<Props extends any>(
    ownAtomInstance: IAtom<any, any>[],
    Wrapped: React.ComponentType<Props>
  ): React.FC<Props>;
  function withProvider<Props extends any>(
    arg1: React.ComponentType<Props> | IAtom<any, any>[],
    arg2?: React.ComponentType<Props>
  ): React.FC<Props> {
    const { Wrapped, ownAtomInstance } = (() => {
      if (typeof arg1 === "function") {
        return { Wrapped: arg1, ownAtomInstance: null };
      } else if (Array.isArray(arg1) && typeof arg2 === "function") {
        return { Wrapped: arg2!, ownAtomInstance: arg1 };
      } else {
        throw new Error(`invalid arguments for withProvider`);
      }
    })();

    const Wrapper: React.FC<Props> = (props) => {
      const parentStore = useContext(storeCtx);
      // Store instance lives in the provider component
      const storeInstance = useState(() => {
        if (parentStore && ownAtomInstance) {
          return new AtomStore({
            store: parentStore,
            atoms: [
              ...Object.values(parentStore.parent?.atoms ?? {}),
              ...ownAtomInstance,
            ],
          });
        }
        return new AtomStore();
      })[0];

      useEffect(() => {
        // When the store component is unmounted,
        // all atomInstances in it should be garbage-collected.
        return () => storeInstance.destroy();
      }, []);

      if (parentStore && !ownAtomInstance) {
        return <Wrapped {...props} />;
      }

      return (
        <storeCtx.Provider value={storeInstance}>
          <Wrapped {...props} />
        </storeCtx.Provider>
      );
    };
    return Wrapper;
  }

  function useAtomValue<State, Actions>(atom: IAtom<State, Actions>) {
    const atomInstance = useAtomInstance(atom);
    const param = useMemo(() => {
      return {
        getCurrentValue: atomInstance._.getCurrentValue,
        subscribe: atomInstance._.subscribe,
      };
    }, [atomInstance]);
    const atomValue: State = us.useSubscription(param);
    return atomValue;
  }

  function useAtomActions<State, Actions>(atom: IAtom<State, Actions>) {
    const atomInstance = useAtomInstance(atom);
    return atomInstance._.actions;
  }

  function useAtom<State, Actions>(atom: IAtom<State, Actions>) {
    return [useAtomValue(atom), useAtomActions(atom)] as const;
  }

  function useStore() {
    const store = useContext(storeCtx);
    if (!store) {
      throw new Error(
        `Unable to find store. Atom should be used under the store's <Provider>`
      );
    }
    return store;
  }

  function useAtomInstance<State, Actions>(atom: IAtom<State, Actions>) {
    const store = useStore();
    const atomInstance = store.getAtomInstance(atom);
    return atomInstance;
  }

  return { withProvider, useAtomValue, useAtomActions, useAtom };
}

export interface IReactStore {
  useAtomValue: <State, Actions>(atom: IAtom<State, Actions>) => State;
  useAtomActions: <State, Actions>(atom: IAtom<State, Actions>) => Actions;
  useAtom<State, Actions>(
    atom: IAtom<State, Actions>
  ): readonly [State, Actions];
  withProvider: <Props extends unknown>(
    Wrapped: React.ComponentType<Props>
  ) => React.FC<Props>;
}
