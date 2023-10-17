import "./style.css"
import { Cinnabun } from "cinnabun"
import { App } from "./App"
import { rootElement } from "./state"

Cinnabun.bake(App(), rootElement)
