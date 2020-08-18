import React from "react";
import { useModel, model } from "./model";

interface IProps {}

const Demo: React.FC<IProps> = (props) => {
  console.log("Demo render");
  return (
    <div>
      <h2>Selector demo</h2>
      <p>
        组件可以只订阅自己感兴趣的状态片段。这样可以让组件避免不必要的重新渲染。
      </p>
      <Child1 />
      <Child2 />
      <Child3 />
    </div>
  );
};

const Child1: React.FC<IProps> = (props) => {
  console.log("Child1 render");
  const num1 = useModel((s) => s.num1);
  return (
    <div>
      <h3>Child1</h3>
      <p>Child1只订阅num1:{num1}</p>
      <button onClick={() => model.reducers.add1()}>add num1</button>
      <button onClick={() => model.reducers.add2()}>add num2</button>
      <button onClick={() => model.reducers.addBoth()}>add both</button>
    </div>
  );
};

const Child2: React.FC<IProps> = (props) => {
  console.log("Child2 render");
  const num2 = useModel((s) => s.num2);
  return (
    <div>
      <h3>Child2</h3>
      <p>Child2只订阅num2:{num2}</p>
      <button onClick={() => model.reducers.add1()}>add num1</button>
      <button onClick={() => model.reducers.add2()}>add num2</button>
      <button onClick={() => model.reducers.addBoth()}>add both</button>
    </div>
  );
};

const Child3: React.FC<IProps> = (props) => {
  console.log("Child3 render");
  const state = useModel();
  return (
    <div>
      <h3>Child3</h3>
      <p>Child3订阅了num1:{state.num1}</p>
      <p>Child3订阅了num2:{state.num2}</p>
      <button onClick={() => model.reducers.add1()}>add num1</button>
      <button onClick={() => model.reducers.add2()}>add num2</button>
      <button onClick={() => model.reducers.addBoth()}>add both</button>
    </div>
  );
};

export default Demo;
