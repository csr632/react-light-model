import React, { useEffect, useState } from "react";
import { counterAtom } from "./atom";
import { atom, createStore } from "../../src";
import { fakeAPI } from "./fakeAPI";

const store = createStore();

interface IProps {}

const fetchAtom = asyncAtom(fakeAPI)

const Demo: React.FC<IProps> = store.withProvider((props) => {
  const [pageNum, setPageNum] = useState(1);
  const [dataAtom, setDataAtom] = useState(() => {
    return atom(fakeAPI(pageNum));
  });
  const actions = store.useAsyncAtom(fetchAtom, fetchParam);

  useEffect(() => {
    fetchAtom()
  }, [fetchParam])
  return (
    <div>
      <h2>Basic demo</h2>
      <p>number:{state.val}</p>
      <div>
        <button onClick={() => actions.inc(1)}>add</button>
        <button onClick={() => actions.dec(1)}>subtract</button>
      </div>
      <div>
        <button onClick={() => actions.asyncInc(100, 1000)}>async</button>
      </div>
    </div>
  );
});

export default Demo;
