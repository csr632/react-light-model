import { from, Subject } from "rxjs";
import { map } from "rxjs/operators";
import { atomBase, getNextAtomInstanceId, IAtom, IAtomInstance } from "./atom";
import { computeValueAndCollectDeps, IGetAtomValue } from "./derive";
import { observableAtom } from "./observable";
import { AtomStore } from "./store";

export class FetcherAtomState<Value> {
  private deps: {
    [id: string]: { ins: IAtomInstance<any, any>; unsub: () => void };
  } = {};

  public loading: boolean = true;
  public value: Value | undefined;
}

export function fetcherAtom<Args extends readonly any[], Result>(
  fetcher: (
    helpers: { getAtomValue: IGetAtomValue; canceled: boolean },
    ...args: Args
  ) => Promise<Result>
) {
  return atomBase(initialize);

  type Value = FetcherAtomState<Result>;

  function initialize(store: AtomStore): IAtomInstance<Value, null> {
    let currentState: Value = new FetcherAtomState<Result>();

    // let currentLoadingPromise = startFetch();

    const notify = new Subject();

    return {
      _: {
        id: getNextAtomInstanceId(),
        getCurrentValue,
        subscribe,
        actions: null,
        onDestroy,
      },
    };

    function getCurrentValue() {
      return currentState;
    }
    function subscribe(callback: any) {
      const subscription = notify.subscribe(callback);
      return () => subscription.unsubscribe();
    }
    function onDestroy() {
      notify.complete();
    }

    // start value and collect deps
    function startFetch(onReFetch: () => void, ...args: Args) {
      const deps: {
        [id: string]: { ins: IAtomInstance<any, any>; unsub: () => void };
      } = {};
      let cancled = false;

      const getAtomValue: IGetAtomValue = (atom) => {
        const atomInstace = store.getAtomInstance(atom);
        if (!deps[atomInstace._.id] && !cancled) {
          const sub = atomInstace._.subscribe(reFetch);
          deps[atomInstace._.id] = { ins: atomInstace, unsub: sub };
        }
        return atomInstace._.getCurrentValue();
      };

      const promise = fetcher(getAtomValue, ...args);

      return { promise, cancle };

      function reFetch() {
        onReFetch();
      }

      function cancle() {
        cancled = true;
        Object.values(deps).forEach(({ unsub }) => {
          unsub();
        });
      }
    }
  }
}

class FetchController {}
