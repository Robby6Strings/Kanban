import { defineConfig } from "vite"

export default defineConfig({
  esbuild: {
    jsx: "transform",
    jsxFactory: "Cinnabun.h",
    jsxFragment: "Cinnabun.fragment",
    jsxInject: "import * as Cinnabun from 'cinnabun'",
  },
})
