import "./ListBoard.css"
import {
  activeLists,
  draggingBoard,
  drag,
  selectedBoard,
  addBoardList,
} from "../state"
import { List } from "./List"

export const ListBoard = () => {
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
        {() => activeLists.value.map((list) => <List list={list} />)}
        <div className="add-list">
          <button
            type="button"
            onclick={() => addBoardList(selectedBoard.value!.id)}
          >
            Add a list...
          </button>
        </div>
      </div>
    </div>
  )
}
