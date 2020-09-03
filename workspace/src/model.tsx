type IReducer<State, Params extends any[] = any[]> = (
  current: State,
  ...params: Params
) => State;

interface IReducers<State> {
  [key: string]: IReducer<State>;
}

type IEffect<State, Reducers> = (
  ctx: {
    get: () => State;
    set: (state: State) => void;
    reducers: Reducers;
  },
  ...params: any[]
) => any;

interface IEffects<State, Reducers> {
  [key: string]: IEffect<State, Reducers>;
}

interface Model<
  State,
  Reducers extends IReducers<State>,
  Effects extends IEffects<State, Reducers>
> {
  state: State;
  reducers: Reducers;
  effects: Effects;
}

function create<
  State,
  Reducers extends IReducers<State>,
  Effects extends IEffects<State, Reducers>
>(state: State, reducers: Reducers, effects: Effects) {
  // const derive = (newState: State) => create(newState, reducers, effects);

  // const reducersApi = Object.entries(reducers).map(([name, reducer]) => {
  //   return [name, (...args: any[]) => reducer(state, ...args)] as const;
  // });

  return {
    state,
    reducers,
    effects,
  };
}

const model = create(
  {
    val: 1,
  },
  {
    inc(cur, amount: number) {
      return { ...cur, val: cur.val + amount };
    },
    dec(cur, amount: number) {
      return { ...cur, val: cur.val - amount };
    },
  },
  {
    async asyncInc({ get, set, reducers }, amount: number, timeout: number) {
      await new Promise((res) => setTimeout(res, timeout));
      const nextState = reducers.inc(get(), amount);
      set(nextState);
    },
  }
);

const nextModel = model.reduce((c, r) => r.inc(c, 2));
