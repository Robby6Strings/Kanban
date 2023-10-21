import { Signal, createSignal, useComputed } from "cinnabun"
import { ListItem, ReactiveListboard } from "./types"
import { loadBoards } from "./db"

export function asyncSignal<T>(promise: Promise<T>): Signal<T | null> {
  const signal = createSignal<T | null>(null)
  promise.then((value) => (signal.value = value))
  return signal
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
export const boards = asyncSignal(loadBoards())
export const selectedBoard = createSignal<ReactiveListboard | null>(null)
export const selectedListItem = createSignal<(ListItem & { listId: number }) | null>(null)
export const showSelectedListItem = createSignal(false)

export function selectBoard(board: ReactiveListboard) {
  selectedBoard.value = board
}
export function selectListItem(item: ListItem, listId: number) {
  selectedListItem.value = { ...item, listId }
}
export function deselectBoard() {
  selectedBoard.value = null
}
export function deselectListItem() {
  selectedListItem.value = null
}

export const activeLists = useComputed(
  () => selectedBoard.value?.lists.filter((list) => !list.value?.archived) ?? [],
  [selectedBoard]
)
export const archivedLists = useComputed(
  () => selectedBoard.value?.lists.filter((list) => list.value?.archived) ?? [],
  [selectedBoard]
)

useComputed(() => {
  if (!draggingBoard.value) return
  const { dragCurrent } = drag.value
  rootElement.scrollLeft -= dragCurrent.x
  rootElement.scrollTop -= dragCurrent.y
}, [drag, draggingBoard])
