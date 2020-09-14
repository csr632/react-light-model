import { Subject } from "rxjs";
import { atomBase, getNextAtomInstanceId } from "./atom";
import type { IAtom, IAtomInstance } from "./atom";
import { AtomStore } from "./store";

export function derive<State>(
  getter: (getAtomValue: GetAtomValue) => State
): IAtom<State, null>;
export function derive<State, Actions>(
  getter: (getAtomValue: GetAtomValue) => State,
  createActions: ICreateActions<State, Actions>
): IAtom<State, Actions>;
export function derive<State, Actions>(
  getter: (getAtomValue: GetAtomValue) => State,
  createActions?: ICreateActions<State, Actions>
): IAtom<State, Actions> {
  return atomBase(initialize);

  function initialize(store: AtomStore): IAtomInstance<State, Actions> {
    const deps: {
      [id: string]: {
        unsubscribe: () => void;
      };
    } = {};
    const initialState = computeValue();
    let currentValue = initialState;
    const subject = new Subject();
    const actions = createActions
      ? createActions({
          get,
          getActions,
        })
      : ((null as unknown) as Actions);

    return {
      _: {
        id: getNextAtomInstanceId(),
        getCurrentValue,
        subscribe,
        actions,
      },
    };

    function get(otherAtom?: IAtom<any, any>) {
      if (!otherAtom) return getCurrentValue();
      return store.getAtomInstance(otherAtom)._.getCurrentValue();
    }

    function getActions(otherAtom: IAtom<any, any>) {
      return store.getAtomInstance(otherAtom)._.actions;
    }

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
                currentValue = nextValue;
                subject.next(null);
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
      return currentValue;
    }
    function subscribe(callback: any) {
      const subscription = subject.subscribe(callback);
      return () => subscription.unsubscribe();
    }
  }
}

type GetAtomValue = <State>(atom: IAtom<State, any>) => State;
export type ICreateActions<State, Actions> = (helpers: {
  get: {
    (): State;
    <OtherAtomState>(atom: IAtom<OtherAtomState, any>): OtherAtomState;
  };
  getActions: <OtherAtomActions>(
    atom: IAtom<any, OtherAtomActions>
  ) => OtherAtomActions;
}) => Actions;
