import { createModel } from "../../src";

const model = createModel({
  state: {
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
      model.effects.asyncFn();
      // this.
      // console.log("before add", this.get().num);
      // await delay(1000);
      // this.reducers.add();
      // console.log("after add", this.get().num);
      // await delay(1000);
      // this.reducers.subtract(10, true);
      // console.log("after subtract", this.get().num);
    },
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
