import { atom } from "../../src";


export const counterAtom = atom(
  {
    val: 1,
  },
  ({ get, set }) => {
    const inc = (amount: number) => {
      set((cur) => ({ ...cur, val: cur.val + amount }));
    };
    return {
      inc,
      dec(amount: number) {
        set((cur) => ({ ...cur, val: cur.val - amount }));
      },
      async asyncInc(amount: number, timeout: number) {
        // 异步流程依靠独立store订阅的存在，无法嵌套到其他store中
        await new Promise((res) => setTimeout(res, timeout));
        console.log("asyncInc", "before inc", get());
        inc(amount);
        console.log("asyncInc", "after inc", get());
      },
    };
  }
);

// const doubleModule = derived((store) => {
//   return { age: 2020 - store.get(birthYearToken) };
// });
