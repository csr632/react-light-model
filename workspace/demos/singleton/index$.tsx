import React from "react";
import { counterAtom } from "./atom";
import { singletonStore } from "../../src";

interface IProps {}

const Demo: React.FC<IProps> = (props) => {
  const [state, actions] = singletonStore.useAtom(counterAtom);
  return (
    <div>
      <h2>SingletonAtom demo</h2>
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
};

export default Demo;
