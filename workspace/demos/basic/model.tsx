import { createModel } from "../../src";

// 在模块执行的时候调用createModel，单例模式
const [useModel, model] = createModel({
  state: {
    /** Comment for num */
    num: 1,
  },
  reducers: {
    /**
     * Comment for add
     */
    add(draft) {
      draft.num += 1;
    },
    /**
     * Comment for subtract
     */
    subtract(draft, payload: number, double?: boolean) {
      draft.num -= payload;
      if (double) draft.num -= payload;
    },
  },
  effects: {
    /**
     * Comment for asyncFn2
     */
    async asyncFn(name: string) {
      console.log(`[${name}]`, "before add", model.getState().num);
      await delay(1000);
      model.reducers.add();
      console.log(`[${name}]`, "after add", model.getState().num);
      await delay(1000);
      model.reducers.subtract(10, true);
      console.log(`[${name}]`, "after subtract", model.getState().num);
    },
  },
});

export { useModel, model };

function delay(ms: number) {
  return new Promise((res) => {
    setTimeout(res, ms);
  });
}
