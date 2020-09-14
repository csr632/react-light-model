export { createStore } from "./store";
export { atom } from "./atom";
export { derive } from "./derive";
import { createSingletonStore } from "./singletonStore";
export { createSingletonStore };

export const singletonStore = createSingletonStore();
