import { Signal, createSignal, useComputed } from "cinnabun"
import { loadLists } from "./list"
import { List, ListItem } from "./types"

export const saveLists = (lists: Signal<List>[]) => {
  localStorage.setItem("lists", JSON.stringify(lists.map((list) => list.value)))
}

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

export const save = () => saveLists(lists.value)

export const lists = createSignal(loadLists())
lists.value.forEach((list) => list.subscribe(save))
lists.subscribe(saveLists)
console.log(lists.value)

export const selectedListItem = createSignal<(ListItem & { listId: string }) | null>(null)
export const showSelectedListItem = createSignal(false)

export const activeLists = useComputed(
  () => lists.value.filter((list) => !list.value.archived),
  [lists]
)
export const archivedLists = useComputed(
  () => lists.value.filter((list) => list.value.archived),
  [lists]
)

useComputed(() => {
  if (!draggingBoard.value) return
  const { dragCurrent } = drag.value
  rootElement.scrollLeft -= dragCurrent.x
  rootElement.scrollTop -= dragCurrent.y
}, [drag, draggingBoard])
