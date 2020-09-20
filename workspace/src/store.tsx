// we should use useMutableSource instead of use-subscription
// useMutableSource is still in react@experimental

import type { IAtom, IAtomInstance } from "./atom";

let nextStoreId = 1;

export class AtomStore {
  public readonly parent?: {
    store: AtomStore;
    atoms: { [id: number]: IAtom<any, any> };
  };
  private readonly atoms: IAtom<any, any>[] = [];
  public readonly storeId = nextStoreId++;

  getAtomInstance<State, Actions>(
    atom: IAtom<State, Actions>
  ): IAtomInstance<State, Actions> {
    if (this.parent?.atoms[atom._.id]) {
      return this.parent.store.getAtomInstance(atom);
    }
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

  constructor(parent?: { store: AtomStore; atoms: IAtom<any, any>[] }) {
    if (parent) {
      const atoms: { [id: number]: IAtom<any, any> } = {};
      parent.atoms.forEach((atom) => {
        atoms[atom._.id] = atom;
      });
      this.parent = { store: parent.store, atoms };
    }
  }
}
