import { Subject } from "rxjs";
import { atomBase, getNextAtomInstanceId, IAtomInstance } from "./atom";
import { IGetAtomValue } from "./derive";
import { AtomStore } from "./store";

export interface IFetcherAtomState<Data> {
  data: Data | null;
  loading: boolean;
  error: any | null;
  trigger: () => void;
}

interface IFetchHelpers {
  getAtomValue: IGetAtomValue;
}

export function fetcherAtom<Result>(
  fetcher: (helpers: IFetchHelpers) => Promise<Result>,
  initialState?: Result
) {
  return atomBase(initialize);

  function initialize(
    store: AtomStore
  ): IAtomInstance<IFetcherAtomState<Result>, null> {
    let currentState: IFetcherAtomState<Result> = {
      data: initialState ?? null,
      loading: false,
      error: null,
      trigger,
    };
    const notify = new Subject();

    let currentLoadingProcess:
      | {
          cancle: () => void;
        }
      | undefined;

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

    function trigger() {
      if (currentLoadingProcess) currentLoadingProcess.cancle();
      currentState = {
        data: currentState.data,
        loading: true,
        error: currentState.error,
        trigger,
      };
      notify.next(null);

      currentLoadingProcess = startFetch(onSuccess, onError, trigger);
    }

    function onSuccess(res: Result) {
      currentState = {
        data: res,
        loading: false,
        error: null,
        trigger,
      };
      notify.next(null);
    }

    function onError(error: any) {
      currentState = {
        data: null,
        loading: false,
        error,
        trigger,
      };
      notify.next(null);
    }

    // start fetch value and collect deps
    function startFetch(
      onSucess: (res: Result) => void,
      onError: (error: any) => void,
      onReFetch: () => void
    ) {
      const deps: {
        [id: string]: { ins: IAtomInstance<any, any>; unsub: () => void };
      } = {};

      let cancled = false;
      const fetchHelpers: IFetchHelpers = {
        getAtomValue(atom) {
          const atomInstace = store.getAtomInstance(atom);
          if (!deps[atomInstace._.id] && !cancled) {
            const sub = atomInstace._.subscribe(reFetch);
            deps[atomInstace._.id] = { ins: atomInstace, unsub: sub };
          }
          return atomInstace._.getCurrentValue();
        },
      };

      fetcher(fetchHelpers).then(
        (res) => {
          if (!cancled) {
            onSucess(res);
          }
        },
        (error) => {
          if (!cancled) {
            onError(error);
          }
        }
      );

      return { cancle };

      function reFetch() {
        cancle();
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
