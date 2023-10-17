import { createSignal, useComputed } from "cinnabun"
import { loadLists, saveState } from "./list"
import { ListItem } from "./types"

export const lists = createSignal(loadLists())
export const selectedListItem = createSignal<ListItem | null>(null)

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
  }
}

export const selectListItem = (listId: string, itemId: string) => {
  const list = lists.value.find((list) => list.id === listId)
  if (list) {
    const item = list.items.find((item) => item.id === itemId)
    if (item) {
      selectedListItem.value = item
    }
  }
}
