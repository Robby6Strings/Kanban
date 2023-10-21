import { Signal, createSignal, useComputed } from "cinnabun"
import {
  List,
  ListBoard,
  ListItem,
  ReactiveList,
  ReactiveListboard,
} from "./types"
import {
  addItem,
  addList,
  loadBoards,
  loadItems,
  loadLists,
  deleteList as db_deleteList,
  archiveList as db_archiveList,
} from "./db"

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
export const selectedListItem = createSignal<ListItem | null>(null)
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
  selectedBoard.notify()
}

export async function addListItem(listId: number) {
  const item = await addItem(listId)
  const list = selectedBoard.value?.lists.find(
    (list) => list.value?.id === listId
  )
  if (!list) return console.error("List not found")

  list.value?.items.value?.push(item)
  list.value.items.notify()
}

export async function deleteList(listId: number) {
  const list = selectedBoard.value?.lists.find(
    (list) => list.value?.id === listId
  )
  if (!list) return console.error("List not found")

  await db_deleteList(list.value)

  selectedBoard.value?.lists.splice(selectedBoard.value?.lists.indexOf(list), 1)
  selectedBoard.notify()
}

export async function archiveList(listId: number) {
  const listSignal = selectedBoard.value?.lists.find(
    (list) => list.value?.id === listId
  )
  if (!listSignal) return console.error("List not found")

  listSignal.value.archived = true
  const { items, ...rest } = listSignal.value
  await db_archiveList({ ...rest })

  listSignal.notify()
  selectedBoard.notify()
}

export function selectListItem(item: ListItem) {
  selectedListItem.value = item
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
