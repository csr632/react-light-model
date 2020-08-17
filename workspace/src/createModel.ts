import type { O, Any, Function } from "ts-toolbelt";
import { produce } from "immer";
import type { Draft } from "immer";

type IReducer<State, Payload extends any[] = any[]> = (
  prev: Function.NoInfer<Draft<State>>,
  ...payload: Payload
) => Function.NoInfer<State> | void;

interface IReducers<State> {
  [key: string]: IReducer<State>;
}

type InferReducerPayload<
  Reducer extends IReducer<any>
> = Reducer extends IReducer<any, infer Payload> ? Payload : never;

type IReducerCaller<Reducer extends IReducer<any>> = (
  ...payload: InferReducerPayload<Reducer>
) => void;

type IReducerCallers<Reducers extends IReducers<any>> = {
  [Type in keyof Reducers]: IReducerCaller<Reducers[Type]>;
};

interface IModelDefinition<
  State extends object,
  Reducers extends IReducers<State>,
  Effects extends IEffects
> {
  state: State;
  reducers: Reducers;
  effects: Effects;
}

export interface IEffects {
  [key: string]: IEffect;
}

type IEffect = (...args: any[]) => any | Promise<any>;

type IModel<
  State extends object,
  Reducers extends IReducers<State>,
  Effects extends IEffects
> = {
  get: () => O.Readonly<State, Any.Key, "deep">;
  reducers: IReducerCallers<Function.NoInfer<Reducers>>;
  effects: Effects;
};

export function createModel<
  State extends object,
  Reducers extends IReducers<State>,
  Effects extends IEffects
>(
  modelDefinition: IModelDefinition<State, Reducers, Effects>
): IModel<State, Reducers, Effects> {
  if (!isObject(modelDefinition.state))
    throw new Error(`model should contains state`);
  if (!isObject(modelDefinition.reducers))
    throw new Error(`model should contains reducers`);
  if (!isObject(modelDefinition.effects))
    throw new Error(`model should contains effects`);

  let state = modelDefinition.state;
  let listeners: Set<() => void> = new Set();

  const setState = (producer: (draft: Draft<State>) => State | void) => {
    const nextState = produce(state, producer) as State;
    if (nextState === state) return;
    state = nextState;
    listeners.forEach((listener) => listener());
  };

  const reducerCallers = (Object.fromEntries(
    Object.entries(modelDefinition.reducers).map(([key, reducer]) => {
      return [
        key,
        (...args: any[]) => {
          setState((draft) => {
            return reducer(draft, ...args);
          });
        },
      ];
    })
  ) as unknown) as IReducerCallers<Reducers>;

  const effects = modelDefinition.effects;

  // const subscribe = 

  return 1 as any;
}

export function useCreateModel() {}

function isObject(value: unknown) {
  return typeof value === "object" && value !== null;
}
