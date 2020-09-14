import { useEffect, useState } from "react";
import { from } from "rxjs";
import { map } from "rxjs/operators";
import { IAtom } from "./atom";
import { observableAtom } from "./observable";

export class AsyncState<Value> {
  readonly atomType = "async" as const;
  constructor(public loading: boolean, public value: Value | undefined) {}
}

export function asyncAtom<Value>(
  promise: Promise<Value>,
  initialValue?: Value
) {
  const observable = from(promise).pipe(
    map<Value, AsyncState<Value>>((value) => new AsyncState(false, value))
  );
  return observableAtom(observable, new AsyncState(true, initialValue));
}


