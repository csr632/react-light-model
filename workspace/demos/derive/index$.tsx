import React from "react";
import { counterAtom, doubleCounterAtom } from "./atom";
import { createAtomStore } from "../../src";

const store = createAtomStore();

interface IProps {}

const Demo: React.FC<IProps> = store.withProvider((props) => {
  const [state, actions] = store.useAtom(counterAtom);
  const [doubleState] = store.useAtom(doubleCounterAtom);
  return (
    <div>
      <h2>Derive atom demo</h2>
      <p>number:{state.val}</p>
      <p>double:{doubleState.val}</p>
      <div>
        <button onClick={() => actions.inc(1)}>add</button>
        <button onClick={() => actions.dec(1)}>subtract</button>
      </div>
      <div>
        <button onClick={() => actions.asyncInc(100, 1000)}>async</button>
      </div>
    </div>
  );
});

export default Demo;
