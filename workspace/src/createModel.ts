import { Object, Any, Function } from "ts-toolbelt";

type IReducer<State, Payload extends any[] = any[]> = (
  prev: Function.NoInfer<State>,
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

interface IEffects {
  [key: string]: IEffect;
}

type IEffect = (...args: any[]) => any | Promise<any>;

type IModel<
  State extends object,
  Reducers extends IReducers<State>,
  Effects extends IEffects
> = {
  get: () => Object.Readonly<State, Any.Key, "deep">;
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
  return 1 as any;
}

export function useCreateModel() {}
