import type { UserConfig } from "vite";
import * as vpr from "vite-plugin-react";
import pages from "vite-plugin-react-pages";
import mdx from "vite-plugin-mdx";
import * as path from "path";

module.exports = {
  jsx: "react",
  plugins: [vpr, mdx(), pages(path.join(__dirname, "./workspace/demos"))],
  root: path.join(__dirname),
  optimizeDeps: {
    include: [
      "styled-components",
      "@mdx-js/react",
      "react-router-dom",
      "use-subscription",
    ],
  },
  minify: false,
} as UserConfig;
