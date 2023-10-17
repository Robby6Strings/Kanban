import "./Board.css"
import { addList, activeLists, draggingBoard, drag } from "../state"
import { List } from "./List"

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
      id="board"
      watch={[activeLists]}
      bind:children
    >
      <div
        watch={draggingBoard}
        bind:className={() => "inner " + (draggingBoard.value ? "dragging" : "")}
      >
        {() => activeLists.value.map((list) => <List list={list} />)}
        <div className="add-list">
          <button type="button" onclick={addList}>
            Add a list...
          </button>
        </div>
      </div>
    </div>
  )
}
