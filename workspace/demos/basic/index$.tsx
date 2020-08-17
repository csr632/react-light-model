import React from "react";
import model from "./model";

interface IProps {}

const Demo: React.FC<IProps> = (props) => {
  return (
    <div>
      add demo:
      <p>number:</p>
      <button onClick={() => model.reducers.add()}>add</button>
      <button onClick={() => model.reducers.subtract(2)}>subtract</button>
    </div>
  );
};

export default Demo;
