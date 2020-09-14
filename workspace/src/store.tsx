// we should use useMutableSource instead of use-subscription
// useMutableSource is still in react@experimental

import React, { useContext, useState, useEffect } from "react";
import us from "use-subscription";
import type { IAtom, IAtomInstance } from "./atom";

let nextStoreId = 1;

export class AtomStore {
  private readonly atoms: IAtom<any, any>[] = [];
  public readonly storeId = nextStoreId++;
  getAtomInstance<State, Actions>(atom: IAtom<State, Actions>) {
    if (!atom._.alreadyInStore(this)) {
      this.atoms.push(atom);
      atom._.initializeForStore(this);
    }
    return atom._.getFromStore(this);
  }
  destroy() {
    this.atoms.forEach((atom) => {
      atom._.deleteFromStore(this);
    });
  }
}

export function createAtomStore(): IAtomStore {
  const storeCtx = React.createContext((null as unknown) as AtomStore);

  const Provider: React.FC = ({ children }) => {
    // Store instance lives in the provider component
    const storeInstance = useState(() => new AtomStore())[0];

    useEffect(() => {
      // When the store component is unmounted,
      // all atomInstances in it should be garbage-collected.
      return () => storeInstance.destroy();
    }, []);

    return (
      <storeCtx.Provider value={storeInstance}>{children}</storeCtx.Provider>
    );
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
    const atomValue: State = us.useSubscription({
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
    const atomInstance = ctxValue.getAtomInstance(atom);
    return atomInstance;
  }

  return { Provider, withProvider, useAtomValue, useAtomActions, useAtom };
}

function createSingletonAtomStore() {}

// function derived() {}

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

export type GetAtomInstance = <State, Actions>(
  atom: IAtom<State, Actions>
) => IAtomInstance<State, Actions>;
