import { Signal, createSignal, useComputed } from "cinnabun"
import { ListBoard, ListItem, ReactiveListboard } from "./types"
import { addList, loadBoards, loadItems, loadLists } from "./db"

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
export const boards = asyncSignal(load())
export const selectedBoard = createSignal<ReactiveListboard | null>(null)
export const selectedListItem = createSignal<
  (ListItem & { listId: number }) | null
>(null)
export const showSelectedListItem = createSignal(false)

async function load() {
  const res = await loadBoards()
  if (res.length > 0) selectBoard(res[0])
  return res
}

export async function selectBoard(board: ListBoard) {
  if (selectedBoard.value?.id === board.id) return

  const lists = (await loadLists(board.id)).map((list) =>
    createSignal({
      ...list,
      items: asyncSignal(loadItems(list.id)),
    })
  )

  selectedBoard.value = {
    ...board,
    lists,
  }
}
export async function addBoardList(boardId: number) {
  const lst = await addList(boardId)
  selectedBoard.value?.lists.push(
    createSignal({
      ...lst,
      items: asyncSignal(loadItems(lst.id)),
    })
  )
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
  () =>
    selectedBoard.value?.lists.filter((list) => !list.value?.archived) ?? [],
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
