import "./Board.css"
import { addList, activeLists } from "../state"
import { List } from "./List"
import { For } from "cinnabun"

export const Board = () => {
  return (
    <div id="board">
      <For each={activeLists} template={(list) => <List list={list} />} />
      <div className="add-list">
        <button type="button" onclick={addList}>
          Add a list...
        </button>
      </div>
    </div>
  )
}
