import { atom, derive } from "../../src";

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

export const doubleCounterAtom = derive((get) => {
  return { val: get(counterAtom).val * 2 };
});

export const plusTwoCounterAtom = derive(
  (get) => {
    return { val: get(doubleCounterAtom).val + 2 };
  },
  ({ getActions, get }) => {
    return {
      addTwo: () => {
        console.log(`You can get current atom's state`, get());
        console.log(`You can get other atom's state`, get(doubleCounterAtom));
        getActions(counterAtom).inc(2);
        console.log(
          `all atoms' state is immediately updated after actions`,
          get()
        );
      },
    };
  }
);
