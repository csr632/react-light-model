export { createStore } from "./react/store";
export { atom } from "./atom";
export { derive } from "./derive";
import { createSingletonStore } from "./react/singletonStore";
export { createSingletonStore };

export const singletonStore = createSingletonStore();
