import React from "react";
import { useModel, model } from "./model";

interface IProps {}

const Demo: React.FC<IProps> = (props) => {
  const state = useModel();
  return (
    <div>
      <h2>Basic demo</h2>
      <p>number:{state.num}</p>
      <div>
        <button onClick={() => model.reducers.add()}>add</button>
        <button onClick={() => model.reducers.subtract(1, true)}>
          subtract
        </button>
      </div>
      <div>
        <button onClick={() => model.effects.asyncFn("basic demo")}>
          async
        </button>
      </div>
    </div>
  );
};

export default Demo;
