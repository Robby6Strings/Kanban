import "./Board.css"
import { createSignal, useRef, RawHtml } from "cinnabun"
import {
  activeLists,
  draggingBoard,
  drag,
  selectedBoard,
  addBoardList,
  clickedItem,
  mousePos,
} from "../state"
import { ItemList } from "./ItemList"

export const Board = () => {
  const draggableRef = useRef()
  const itemClone = createSignal<HTMLElement | null>(null)

  const handleMouseDown = (e: MouseEvent) => {
    if (!draggableRef.value) return
    if (e.target !== draggableRef.value) return
    draggingBoard.value = true
  }

  const handleMouseUp = () => {
    draggingBoard.value = false
    if (clickedItem.value) clickedItem.value.dragging = false
    clickedItem.value = null
    itemClone.value = null
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (clickedItem.value && !clickedItem.value.dragging) {
      clickedItem.value.dragging = true
      clickedItem.notify()
      itemClone.value = clickedItem.value.element
      return
    } else if (clickedItem.value && clickedItem.value.dragging) {
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
        watch={[draggingBoard, clickedItem]}
        bind:className={() =>
          "inner " +
          (draggingBoard.value || clickedItem.value?.dragging ? "dragging" : "")
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
      <div
        watch={[itemClone, mousePos]}
        id="item-clone"
        bind:children
        bind:style={() =>
          "transform: translate(" +
          (mousePos.value.x - (clickedItem.value?.mouseOffset.x || 0)) +
          "px, " +
          (mousePos.value.y - (clickedItem.value?.mouseOffset.y || 0)) +
          "px)"
        }
      >
        {() => <RawHtml html={clickedItem.value?.element.outerHTML || ""} />}
      </div>
    </div>
  )
}
