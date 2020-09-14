import React, { useContext, useState, useEffect, useMemo } from "react";
import us from "use-subscription";

import { AtomStore } from "../store";
import type { IAtom } from "../atom";
import { asyncAtom, AsyncState } from "../async";
import {
  computeValueAndCollectDeps,
  derive,
  IGetAtomValue,
  subscribeDeps,
} from "../derive";

export function createStore(): IReactStore {
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

  // function getAtomValue(atom: IAtom<any, any>) {
  //   const atomInstace = store.getAtomInstance(atom);
  //   if (!newDeps[atomInstace._.id]) newDeps[atomInstace._.id] = atomInstace;
  //   return atomInstace._.getCurrentValue();
  // }

  // function useCallAction() {}
  // In order to be performant, getter1 should be stable (it shouldn't use props)
  type ResolveAtom<Atom> = Atom extends IAtom<infer V, any> ? V : never;
  type ResolveAtomArr<
    AtomArr extends [IAtom<any, any>, ...IAtom<any, any>[]]
  > = {
    [Index in keyof AtomArr]: ResolveAtom<AtomArr[Index]>;
  };

  // Compared with "useAtomValue for multiple times",
  // the advantage of useBatchedSubscribe is that
  // selectAtoms can be dynamic
  function useBatchedSubscribe<
    // https://github.com/microsoft/TypeScript/pull/26063#issuecomment-461874655
    AtomArr extends [IAtom<any, any>, ...IAtom<any, any>[]]
  >(selectAtoms: AtomArr) {
    const atom = useMemo(
      () =>
        derive<ResolveAtomArr<AtomArr>>((get) => {
          return selectAtoms.map(get) as any;
        }),
      [...selectAtoms]
    );
    return useAtomValue(atom);
  }

  /**
   * create async atom based on props
   */
  function useAsyncAtom<Args extends readonly any[], Return extends any>(
    asyncFn: (...args: Args) => Promise<Return>,
    ...args: Args
  ) {
    const [currentAtom, setCurrentAtom] = useState<
      IAtom<AsyncState<Return>, null>
    >(dummyAsyncAtom);

    useEffect(() => {
      const newAtom = asyncAtom(asyncFn(...args));
      setCurrentAtom(newAtom);
    }, [asyncFn, ...args]);

    return currentAtom;
  }

  return { Provider, withProvider, useAtomValue, useAtomActions, useAtom };
}

const dummyAsyncAtom = asyncAtom(new Promise<any>(() => null));

export interface IReactStore {
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
