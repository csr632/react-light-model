import React from "react";
import { counterAtom } from "./atom";
import { createStore } from "../../src";

const store = createStore();

interface IProps {}

const Demo: React.FC<IProps> = store.withProvider((props) => {
  const [state, actions] = store.useAtom(counterAtom);
  return (
    <div>
      <h2>Basic demo</h2>
      <p>number:{state.val}</p>
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
