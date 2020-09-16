import { Subject } from "rxjs";
import type { Observable } from "rxjs";
import { atomBase, getNextAtomInstanceId, IAtomInstance } from "./atom";

export function observableAtom<Value>(
  observable: Observable<Value>,
  initialValue: Value
) {
  return atomBase(initialize);

  function initialize(): IAtomInstance<Value, null> {
    let currentState: Value = initialValue;
    const notify = new Subject();
    // FIXME initialize should be pure
    // Lazy Initialization: https://gist.github.com/sebmarkbage/75f0838967cd003cd7f9ab938eb1958f#lazy-initialization
    // We should create a phase named initialize-effect
    // and put side-effect in it
    const sub = observable.subscribe((nextVal) => {
      currentState = nextVal;
      notify.next(null);
    });

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
      sub.unsubscribe();
    }
  }
}
