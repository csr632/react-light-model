import { BehaviorSubject } from "rxjs";
import { atomBase, IAtom, IAtomInstance, getNextAtomInstanceId } from "./atom";
import { AtomStore } from "./store";

type GetAtomValue = <State>(atom: IAtom<State, any>) => State;

export function derive<State, Actions>(
  getter: (getAtomValue: GetAtomValue) => State,
  actions: Actions
): IAtom<State, Actions> {
  return atomBase(initialize);

  function initialize(store: AtomStore): IAtomInstance<State, Actions> {
    const deps: {
      [id: string]: {
        unsubscribe: () => void;
      };
    } = {};
    const initialState = computeValue();
    const subject = new BehaviorSubject(initialState);
    return {
      _: {
        id: getNextAtomInstanceId(),
        getCurrentValue,
        subscribe,
        actions,
      },
    };

    // compute value and collect deps
    function computeValue() {
      const newDeps: { [id: string]: IAtomInstance<any, any> } = {};
      const value = getter(getAtomValue);
      Object.keys(deps).forEach((oldDepId) => {
        if (!newDeps[oldDepId]) {
          deps[oldDepId].unsubscribe();
          delete deps[oldDepId];
        }
      });
      Object.keys(newDeps).forEach((newDepId) => {
        if (!deps[newDepId]) {
          deps[newDepId] = {
            unsubscribe: newDeps[newDepId]._.subscribe(() => {
              const nextValue = computeValue();
              if (nextValue !== getCurrentValue()) {
                subject.next(nextValue);
              }
            }),
          };
        }
      });
      return value;

      function getAtomValue(atom: IAtom<any, any>) {
        const atomInstace = store.getAtomInstance(atom);
        if (!newDeps[atomInstace._.id]) newDeps[atomInstace._.id] = atomInstace;
        return atomInstace._.getCurrentValue();
      }
    }
    function getCurrentValue() {
      return subject.getValue();
    }
    function subscribe(callback: any) {
      const subscription = subject.subscribe(callback);
      return () => subscription.unsubscribe();
    }
  }
}
