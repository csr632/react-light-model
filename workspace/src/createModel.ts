import type { Function } from "ts-toolbelt";
import { produce } from "immer";
import type { Draft } from "immer";
import createStore from "zustand";
import type { StateSelector, EqualityChecker } from "zustand";

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

type IModelAPI<
  State extends object,
  Reducers extends IReducers<State>,
  Effects extends IEffects
> = {
  getState: () => State;
  reducers: IReducerCallers<Function.NoInfer<Reducers>>;
  effects: Effects;
  // subscribe: Subscribe<State>;
};

export interface IUseModel<State extends object> {
  (): State;
  <U>(selector: StateSelector<State, U>, equalityFn?: EqualityChecker<U>): U;
}

export function createModel<
  State extends object,
  Reducers extends IReducers<State>,
  Effects extends IEffects
>(
  modelDefinition: IModelDefinition<State, Reducers, Effects>
): [IUseModel<State>, IModelAPI<State, Reducers, Effects>] {
  if (!isObject(modelDefinition.state))
    throw new Error(`model should contains state`);
  if (!isObject(modelDefinition.reducers))
    throw new Error(`model should contains reducers`);
  if (!isObject(modelDefinition.effects))
    throw new Error(`model should contains effects`);

  const useStore = createStore(() => modelDefinition.state);
  const storeAPI = useStore;

  const reducerCallers = (Object.fromEntries(
    Object.entries(modelDefinition.reducers).map(([key, reducer]) => {
      return [
        key,
        (...args: any[]) => {
          storeAPI.setState(
            produce((draft) => {
              return reducer(draft, ...args);
            })
          );
        },
      ];
    })
  ) as unknown) as IReducerCallers<Reducers>;
  const effects = modelDefinition.effects;

  function useModel<U>(
    selector: StateSelector<State, U>,
    equalityFn?: EqualityChecker<U>
  ): U;
  function useModel(): State;
  function useModel(selector?: any, equalityFn?: any) {
    return useStore(selector, equalityFn);
  }
  const modelApi: IModelAPI<State, Reducers, Effects> = {
    getState: storeAPI.getState,
    reducers: reducerCallers,
    effects,
  };
  return [useModel, modelApi];
}

function isObject(value: unknown) {
  return typeof value === "object" && value !== null;
}
