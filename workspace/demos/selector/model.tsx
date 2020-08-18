import { createModel } from "../../src";

// 在模块执行的时候调用createModel，单例模式
const [useModel, model] = createModel({
  state: {
    num1: 1,
    num2: 2,
  },
  reducers: {
    add1(draft) {
      draft.num1 += 1;
    },
    add2(draft) {
      draft.num2 += 1;
    },
    addBoth(draft) {
      draft.num1 += 1;
      draft.num2 += 1;
    },
  },
  effects: {},
});

export { useModel, model };
