import us from "use-subscription";
import { IAtom } from "./atom";
import { AtomStore } from "./store";

export function createSingletonStore() {
  const store = new AtomStore();

  function useAtomValue<State, Actions>(atom: IAtom<State, Actions>) {
    const atomInstance = store.getAtomInstance(atom);
    const atomValue: State = us.useSubscription({
      getCurrentValue: atomInstance._.getCurrentValue,
      subscribe: atomInstance._.subscribe,
    });
    return atomValue;
  }

  function useAtomActions<State, Actions>(atom: IAtom<State, Actions>) {
    const atomInstance = store.getAtomInstance(atom);
    return atomInstance._.actions;
  }

  function useAtom<State, Actions>(atom: IAtom<State, Actions>) {
    return [useAtomValue(atom), useAtomActions(atom)] as const;
  }

  return { useAtomValue, useAtomActions, useAtom };
}
