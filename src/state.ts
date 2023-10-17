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

useComputed(() => {
  if (!draggingBoard.value) return
  const { dragCurrent } = drag.value
  rootElement.scrollLeft -= dragCurrent.x
  rootElement.scrollTop -= dragCurrent.y
}, [drag, draggingBoard])

export const lists = createSignal(loadLists())
export const selectedListItem = createSignal<(ListItem & { listId: string }) | null>(null)
export const showSelectedListItem = createSignal(false)

export const activeLists = useComputed(() => lists.value.filter((list) => !list.archived), [lists])
export const archivedLists = useComputed(() => lists.value.filter((list) => list.archived), [lists])

lists.subscribe(saveState)
console.log(lists.value)

export const addList = () => {
  lists.value.push({
    id: Date.now().toString(),
    title: "",
    items: [] as ListItem[],
    archived: false,
  })
  lists.notify()
}

export const removeList = (id: string) => {
  lists.value = lists.value.filter((list) => list.id !== id)
}

export const archiveList = (id: string) => {
  const list = lists.value.find((list) => list.id === id)
  if (list) {
    list.archived = true
    lists.notify()
  }
}

export const addListItem = (listId: string) => {
  const list = lists.value.find((list) => list.id === listId)
  if (list) {
    list.items.push({
      id: Date.now().toString(),
      title: "",
      archived: false,
      description: "",
      refereceItems: [],
    })
    lists.notify()
  }
}

export const removeListItem = (listId: string, itemId: string) => {
  const list = lists.value.find((list) => list.id === listId)
  if (list) {
    list.items = list.items.filter((item) => item.id !== itemId)
    lists.notify()
    selectedListItem.value = null
    showSelectedListItem.value = false
  }
}

export const archiveListItem = (listId: string, itemId: string) => {
  const list = lists.value.find((list) => list.id === listId)
  if (list) {
    const item = list.items.find((item) => item.id === itemId)
    if (item) {
      item.archived = true
      lists.notify()
      selectedListItem.value = null
      showSelectedListItem.value = false
    }
  }
}

export const selectListItem = (listId: string, itemId: string) => {
  const list = lists.value.find((list) => list.id === listId)
  if (list) {
    const item = list.items.find((item) => item.id === itemId)
    if (item) {
      selectedListItem.value = { ...item, listId }
    }
    showSelectedListItem.value = true
  }
}
