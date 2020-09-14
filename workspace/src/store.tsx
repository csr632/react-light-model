// we should use useMutableSource instead of use-subscription
// useMutableSource is still in react@experimental

import type { IAtom } from "./atom";

let nextStoreId = 1;

export class AtomStore {
  private readonly atoms: IAtom<any, any>[] = [];
  public readonly storeId = nextStoreId++;
  getAtomInstance<State, Actions>(atom: IAtom<State, Actions>) {
    if (!atom._.alreadyInStore(this)) {
      this.atoms.push(atom);
      atom._.initializeForStore(this);
    }
    return atom._.getFromStore(this);
  }
  destroy() {
    this.atoms.forEach((atom) => {
      const instance = this.getAtomInstance(atom);
      if (typeof instance._.onDestroy === "function") {
        instance._.onDestroy();
      }
      atom._.deleteFromStore(this);
    });
  }
}
