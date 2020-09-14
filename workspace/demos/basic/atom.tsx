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
        await new Promise((res) => setTimeout(res, timeout));
        console.log("asyncInc", "before inc", get());
        inc(amount);
        console.log("asyncInc", "after inc", get());
      },
    };
  }
);
