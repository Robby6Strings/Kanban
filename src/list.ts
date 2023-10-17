import { lists, selectedListItem, showSelectedListItem } from "./state"
import { List, ListItem } from "./types"

export const loadLists = () => {
  const lists = localStorage.getItem("lists")
  if (lists) {
    try {
      return JSON.parse(lists) as List[]
    } catch (error) {
      console.error("failed to parse locally saved lists", error)
    }
  }
  return []
}

export const saveState = (lists: List[]) => {
  localStorage.setItem("lists", JSON.stringify(lists))
}

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
