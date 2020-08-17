import React from "react";
import ReactDom from "react-dom";

// edit this import path
// if you want to view another demo in CodeSandbox
import Demo from "../demos/demo2/index$";

if (!document.querySelector("#app-root")) {
  const root = document.createElement("div");
  root.id = "app-root";
  document.body.appendChild(root);
}

ReactDom.render(<Demo />, document.querySelector("#app-root"));
