import "./Board.css"
import { addList, lists } from "../state"
import { List } from "./List"
import { For } from "cinnabun"

export const Board = () => {
  return (
    <div id="board">
      <For each={lists} template={(list) => <List list={list} />} />
      <div className="add-list">
        <button type="button" onclick={addList}>
          Add a list...
        </button>
      </div>
    </div>
  )
}
