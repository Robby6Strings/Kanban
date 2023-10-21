import "./Board.css"
import {
  activeLists,
  draggingBoard,
  drag,
  selectedBoard,
  addBoardList,
} from "../state"
import { ItemList } from "./ItemList"

export const Board = () => {
  const handleMouseDown = () => {
    draggingBoard.value = true
  }
  const handleMouseUp = () => {
    draggingBoard.value = false
  }
  const handleMouseMove = (e: MouseEvent) => {
    if (!draggingBoard.value) return
    drag.value.dragCurrent = {
      x: e.movementX,
      y: e.movementY,
    }

    drag.notify()
  }

  return (
    <div
      onmousedown={handleMouseDown}
      onmouseup={handleMouseUp}
      onmousemove={handleMouseMove}
      id="listboard"
      watch={[activeLists, selectedBoard]}
      bind:visible={() => !!selectedBoard.value}
      bind:children
    >
      <div
        watch={draggingBoard}
        bind:className={() =>
          "inner " + (draggingBoard.value ? "dragging" : "")
        }
      >
        {() => activeLists.value.map((list) => <ItemList list={list} />)}
        <div className="add-list">
          <button
            type="button"
            className="btn-primary"
            onclick={() => addBoardList(selectedBoard.value!.id)}
          >
            Add a list...
          </button>
        </div>
      </div>
    </div>
  )
}
