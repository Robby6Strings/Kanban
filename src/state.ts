import { Signal, createSignal, useComputed } from "cinnabun"
import { ListBoard, ListItem, ReactiveList, ReactiveListboard } from "./types"
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
  addBoard,
} from "./db"
import { sortByOrder } from "./utils"

export function asyncSignal<T>(promise: Promise<T>): Signal<T | null> {
  const signal = createSignal<T | null>(null)
  promise.then((value) => (signal.value = value))
  return signal
}

export const drag = createSignal({
  dragStart: { x: 0, y: 0 },
  dragCurrent: { x: 0, y: 0 },
})

export const rootElement = document.getElementById("app")!
export const mousePos = createSignal({ x: 0, y: 0 })
export const draggingBoard = createSignal(false)

export const boards = asyncSignal(
  new Promise<ListBoard[]>(async (res) => {
    const boards = await loadBoards()
    if (boards.length === 0) {
      const board = await addBoard()
      boards.push(board)
    }
    selectBoard(boards[0])
    res(boards)
  })
)
export const selectedBoard = createSignal<ReactiveListboard | null>(null)
export const selectedListItem = createSignal<ListItem | null>(null)
export const showSelectedListItem = createSignal(false)

export const itemClone = createSignal<HTMLElement | null>(null)
export const listClone = createSignal<HTMLElement | null>(null)

// a representation of 'where our currently dragged item is'
export const listItemDragTarget = createSignal<{
  index: number
  listId: number
  initial: boolean
} | null>(null)
// a representation of 'our currently dragged item'
export const clickedItem = createSignal<{
  id: number
  index: number
  listId: number
  dragging: boolean
  element: HTMLElement
  mouseOffset: { x: number; y: number }
} | null>(null)

// a representation of 'where our currently dragged list is'
export const listDragTarget = createSignal<{ index: number } | null>(null)
// a representation of 'our currently dragged list'
export const clickedList = createSignal<{
  id: number
  index: number
  dragging: boolean
  element: HTMLElement
  mouseOffset: { x: number; y: number }
} | null>(null)

export async function selectBoard(board: ListBoard) {
  if (selectedBoard.value?.id === board.id) return

  const lists = await loadLists(board.id)
  const asSignals = await Promise.all(
    lists.sort(sortByOrder).map(async (list) => {
      const items = (await loadItems(list.id)).sort(sortByOrder)
      return createSignal({
        ...list,
        items: createSignal(items),
      })
    })
  )
  console.log("selectBoard", asSignals[0]?.value?.items.value)
  selectedBoard.value = {
    ...board,
    lists: asSignals,
  }
}

export async function addBoardList(boardId: number) {
  const maxListOrder = Math.max(
    ...(selectedBoard.value?.lists.map((l) => l.value?.order) ?? []),
    -1
  )
  const lst = await addList(boardId, maxListOrder + 1)
  selectedBoard.value?.lists.push(
    createSignal({
      ...lst,
      items: createSignal([] as ListItem[]),
    })
  )
  selectedBoard.notify()
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

export async function addListItem(listId: number) {
  const list = selectedBoard.value?.lists.find(
    (list) => list.value.id === listId
  )
  if (!list) return console.error("List not found")
  const maxListOrder = Math.max(
    ...list.value.items.value.map((i) => i.order),
    -1
  )
  const item = await addItem(listId, maxListOrder + 1)

  list.value.items.value.push(item)
  list.value.items.notify()
}

export async function updateListItem(item: ListItem) {
  const list = getItemList(item)
  const index = getListItemIdx(item, list)

  const res = await updateItem(item)

  //console.log(res, index, list.value.items.value)

  list.value.items.value[index] = res
  list.notify()
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
  await updateItem(item)

  list.value.items.value.splice(index, 1)
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
