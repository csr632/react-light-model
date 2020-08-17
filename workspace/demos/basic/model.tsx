import { createModel } from "../../src";

const model = createModel({
  state: {
    /** Comment for num */
    num: 1,
    obj: {
      str: "123",
      arr: [2, true],
    },
  },
  reducers: {
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
    async asyncFn() {
      console.log("before add", model.get().num);
      await delay(1000);
      model.reducers.add();
      console.log("after add", model.get().num);
      await delay(1000);
      model.reducers.subtract(10, true);
      console.log("after subtract", model.get().num);
      model.effects.asyncFn2("param");
    },
    /**
     * Comment for asyncFn2
     */
    asyncFn2(param: string) {},
  },
});

model.effects.asyncFn();
model.reducers.subtract(10, true);

export default model;

function delay(ms: number) {
  return new Promise((res) => {
    setTimeout(res, ms);
  });
}
