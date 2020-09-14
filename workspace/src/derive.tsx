import { Subject } from "rxjs";
import { atomBase, getNextAtomInstanceId } from "./atom";
import type { IAtom, IAtomInstance } from "./atom";
import { AtomStore } from "./store";

interface IOpts<State, Actions> {
  actions?: ICreateActions<State, Actions>;
  isSame?: (prev: State, current: State) => boolean;
}

export function derive<State>(
  getter: (getAtomValue: IGetAtomValue) => State
): IAtom<State, never>;
export function derive<State, Actions>(
  getter: (getAtomValue: IGetAtomValue) => State,
  createActions: ICreateActions<State, Actions>
): IAtom<State, Actions>;
// Why not put getter in the opts argument?
// Because that will make typescript fail to inter the type for State.
export function derive<State, Actions = never>(
  getter: (getAtomValue: IGetAtomValue) => State,
  opts: IOpts<State, Actions>
): IAtom<State, Actions>;

export function derive<State, Actions = never>(
  getter: (getAtomValue: IGetAtomValue) => State,
  optsOrCreateActions?:
    | undefined
    | ICreateActions<State, Actions>
    | IOpts<State, Actions>
): IAtom<State, Actions> {
  const opts: IOpts<State, Actions> = (() => {
    if (!optsOrCreateActions) return {};
    if (typeof optsOrCreateActions === "function") {
      return {
        actions: optsOrCreateActions,
      };
    }
    return optsOrCreateActions;
  })();
  const { actions: createActions, isSame = (a, b) => a === b } = opts;
  return atomBase(initialize);

  function initialize(store: AtomStore): IAtomInstance<State, Actions> {
    let depSubscriptions: IDepSubscriptions = {};
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
        onDestroy,
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
      const { deps: newDeps, value } = computeValueAndCollectDeps(
        getter,
        store
      );
      depSubscriptions = subscribeDeps(depSubscriptions, newDeps, () => {
        const nextValue = computeValue();
        if (!isSame(getCurrentValue(), nextValue)) {
          currentValue = nextValue;
          subject.next(null);
        }
      });

      return value;
    }
    function getCurrentValue() {
      return currentValue;
    }
    function subscribe(callback: any) {
      const subscription = subject.subscribe(callback);
      return () => subscription.unsubscribe();
    }
    function onDestroy() {
      Object.values(depSubscriptions).forEach(({ unsubscribe }) => {
        unsubscribe();
      });
      subject.complete();
    }
  }
}

export function computeValueAndCollectDeps<State>(
  getter: (getAtomValue: IGetAtomValue) => State,
  store: AtomStore
) {
  const deps: { [id: string]: IAtomInstance<any, any> } = {};
  const value = getter(getAtomValue);
  return { value, deps };

  function getAtomValue(atom: IAtom<any, any>) {
    const atomInstace = store.getAtomInstance(atom);
    if (!deps[atomInstace._.id]) deps[atomInstace._.id] = atomInstace;
    return atomInstace._.getCurrentValue();
  }
}

export function subscribeDeps(
  oldDepSubscriptions: IDepSubscriptions,
  newDeps: IDeps,
  callback: () => void
) {
  const subscriptions = { ...oldDepSubscriptions };
  Object.keys(subscriptions).forEach((oldDepId) => {
    if (!newDeps[oldDepId]) {
      subscriptions[oldDepId].unsubscribe();
      delete subscriptions[oldDepId];
    }
  });
  Object.keys(newDeps).forEach((newDepId) => {
    if (!subscriptions[newDepId]) {
      subscriptions[newDepId] = {
        unsubscribe: newDeps[newDepId]._.subscribe(() => {
          callback();
        }),
      };
    }
  });
  return subscriptions;
}

type IDeps = { [id: string]: IAtomInstance<any, any> };
type IDepSubscriptions = {
  [id: string]: {
    unsubscribe: () => void;
  };
};
export type IGetAtomValue = <State>(atom: IAtom<State, any>) => State;
export type ICreateActions<State, Actions> = (helpers: {
  get: {
    (): State;
    <OtherAtomState>(atom: IAtom<OtherAtomState, any>): OtherAtomState;
  };
  getActions: <OtherAtomActions>(
    atom: IAtom<any, OtherAtomActions>
  ) => OtherAtomActions;
}) => Actions;
