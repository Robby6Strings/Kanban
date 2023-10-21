import "./Board.css"
import { createSignal, useRef } from "cinnabun"
import {
  activeLists,
  draggingBoard,
  drag,
  selectedBoard,
  addBoardList,
  clickedItem,
} from "../state"
import { ItemList } from "./ItemList"

export const Board = () => {
  const draggableRef = useRef()

  const handleMouseDown = (e: MouseEvent) => {
    if (!draggableRef.value) return
    if (e.target !== draggableRef.value) return
    draggingBoard.value = true
  }

  const handleMouseUp = () => {
    draggingBoard.value = false
    if (clickedItem.value) clickedItem.value.dragging = false
    clickedItem.value = null
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (clickedItem.value && !clickedItem.value.dragging) {
      clickedItem.value.dragging = true
      clickedItem.notify()
      return
    }
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
      watch={[activeLists, selectedBoard]}
      bind:visible={() => !!selectedBoard.value}
      bind:children
    >
      <div
        ref={draggableRef}
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
