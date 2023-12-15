import "./Board.css"
import { createSignal, useRef, RawHtml, Signal } from "cinnabun"
import {
  activeLists,
  draggingBoard,
  drag,
  selectedBoard,
  addBoardList,
  clickedItem,
  mousePos,
  listItemDragTarget,
  clickedList,
  itemClone,
  listClone,
} from "../state"
import { ItemList } from "./ItemList"
import { updateItem } from "../db"
import { sortByOrder } from "../utils"
import { ReactiveList } from "../types"

export const Board = () => {
  const elementRef = useRef()

  const handleMouseDown = (e: MouseEvent) => {
    if (!elementRef.value) return
    if (e.target !== elementRef.value) return
    draggingBoard.value = true
  }

  const handleMouseUp = async () => {
    draggingBoard.value = false
    if (clickedItem.value) {
      const isOriginList =
        listItemDragTarget.value?.listId === clickedItem.value.listId

      const movedItem = !(
        isOriginList &&
        listItemDragTarget.value?.index === clickedItem.value.index + 1
      )

      if (movedItem && clickedItem.value.dragging && listItemDragTarget.value) {
        //debugger

        let targetIndex = listItemDragTarget.value.index
        if (isOriginList && clickedItem.value.index < targetIndex) targetIndex--

        let targetList: Signal<ReactiveList> | null = null
        let sourceList: Signal<ReactiveList> | null = null
        for (let i = 0; i < selectedBoard.value!.lists.length; i++) {
          const l = selectedBoard.value!.lists[i]
          if (l.value.id === clickedItem.value.listId) {
            sourceList = l
          }
          if (l.value.id === listItemDragTarget.value!.listId) {
            targetList = l
          }
        }
        if (!targetList) throw new Error("no target list")
        if (!sourceList) throw new Error("no source list")

        const sourceIndex = clickedItem.value.index
        const item = sourceList.value.items.value.splice(sourceIndex, 1)[0]

        item.listId = targetList.value.id
        item.order = targetIndex
        targetList.value.items.value.splice(targetIndex, 0, item)

        let itemUpdates = [item]

        for (let i = 0; i < targetList.value.items.value.length; i++) {
          const _item = targetList.value.items.value[i]
          if (_item.id === item.id) continue
          if (_item.order !== i) {
            _item.order = i
            itemUpdates.push(_item)
          }
        }
        for (let i = 0; i < sourceList.value.items.value.length; i++) {
          const _item = sourceList.value.items.value[i]
          if (_item.id === item.id) continue
          if (_item.order !== i) {
            _item.order = i
            itemUpdates.push(_item)
          }
        }
        await Promise.all(itemUpdates.map(updateItem))

        targetList.value.items.value.sort(sortByOrder)
        if (!isOriginList) {
          sourceList.value.items.value.sort(sortByOrder)
        }

        selectedBoard.notify()
      }
      listItemDragTarget.value = null
      clickedItem.value.dragging = false
      clickedItem.value = null
    } else if (draggingBoard.value) {
      draggingBoard.value = false
    }
    if (clickedList.value) {
      clickedList.value.dragging = false
      clickedList.value = null
    }
    itemClone.value = null
    listClone.value = null
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (clickedList.value && !clickedList.value.dragging) {
      clickedList.value.dragging = true
      clickedList.notify()
      listClone.value = clickedList.value.element
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
        ref={elementRef}
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
        bind:visible={() => !!clickedItem.value?.dragging}
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

      <div
        watch={[listClone, mousePos]}
        id="list-clone"
        bind:children
        bind:visible={() => !!clickedList.value?.dragging}
        bind:style={() =>
          "transform: translate(" +
          (mousePos.value.x - (clickedList.value?.mouseOffset.x || 0)) +
          "px, " +
          (mousePos.value.y - (clickedList.value?.mouseOffset.y || 0)) +
          "px)"
        }
      >
        {() => <RawHtml html={clickedList.value?.element.outerHTML || ""} />}
      </div>
    </div>
  )
}
