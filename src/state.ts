import { createSignal, useComputed } from "cinnabun"
import { loadLists, saveState } from "./list"
import { ListItem } from "./types"

type DragState = {
  dragStart: { x: number; y: number }
  dragCurrent: { x: number; y: number }
}

export const drag = createSignal<DragState>({
  dragStart: { x: 0, y: 0 },
  dragCurrent: { x: 0, y: 0 },
})

export const rootElement = document.getElementById("app")!

export const draggingBoard = createSignal(false)

export const lists = createSignal(loadLists())
export const selectedListItem = createSignal<(ListItem & { listId: string }) | null>(null)
export const showSelectedListItem = createSignal(false)

export const activeLists = useComputed(() => lists.value.filter((list) => !list.archived), [lists])
export const archivedLists = useComputed(() => lists.value.filter((list) => list.archived), [lists])

lists.subscribe(saveState)
console.log(lists.value)

useComputed(() => {
  if (!draggingBoard.value) return
  const { dragCurrent } = drag.value
  rootElement.scrollLeft -= dragCurrent.x
  rootElement.scrollTop -= dragCurrent.y
}, [drag, draggingBoard])
