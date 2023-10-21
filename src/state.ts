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
  updateList as db_updateList,
  updateItem,
  deleteItem,
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

export const clickedItem = createSignal<{
  id: number
  dragging: boolean
} | null>(null)

async function load() {
  const res = await loadBoards()
  if (res.length > 0) selectBoard(res[0])
  return res
}

export async function selectBoard(board: ListBoard) {
  if (selectedBoard.value?.id === board.id) return

  const lists = await loadLists(board.id)
  const asSignals = await Promise.all(
    lists.map(async (list) => {
      const items = await loadItems(list.id)
      return createSignal({
        ...list,
        items: createSignal(items),
      })
    })
  )
  selectedBoard.value = {
    ...board,
    lists: asSignals,
  }
}

export async function addBoardList(boardId: number) {
  const lst = await addList(boardId)
  selectedBoard.value?.lists.push(
    createSignal({
      ...lst,
      items: createSignal([] as ListItem[]),
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

export async function updateList(list: ReactiveList) {
  const { items, ...rest } = list
  return db_updateList(rest)
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

const getListItemIdx = (item: ListItem, list: Signal<ReactiveList>) => {
  const idx = list.value?.items.value?.findIndex((i) => i.id === item.id)
  if (idx === undefined) throw new Error("Item not found")

  return idx
}

const getItemList = (item: ListItem) => {
  const list = selectedBoard.value?.lists.find(
    (list) => list.value?.id === item.listId
  )
  if (!list) throw new Error("List not found")

  return list
}

export async function updateListItem(item: ListItem) {
  const list = getItemList(item)
  const index = getListItemIdx(item, list)

  const res = await updateItem(item)

  list.value.items.value![index] = res
  list.value.items.notify()
}

export async function deleteListItem(item: ListItem) {
  const list = getItemList(item)
  const index = getListItemIdx(item, list)

  await deleteItem(item)

  list.value.items.value!.splice(index, 1)
  list.value.items.notify()
}

export async function archiveListItem(item: ListItem) {
  const list = getItemList(item)
  const index = getListItemIdx(item, list)

  item.archived = true
  const res = await updateItem(item)

  list.value.items.value![index] = res
  list.value.items.notify()
}

export function selectListItem(item: ListItem) {
  selectedListItem.value = item
  showSelectedListItem.value = true
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
