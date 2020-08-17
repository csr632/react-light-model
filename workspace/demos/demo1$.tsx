import React from "react";
import { add } from "../src";

interface IProps {}

const Demo: React.FC<IProps> = (props) => {
  return (
    <div>
      add demo:
      <p>1+1={add(1, 1)}</p>
    </div>
  );
};

export default Demo;
