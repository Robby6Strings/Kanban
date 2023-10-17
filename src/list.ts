import { createSignal } from "cinnabun"
import { lists, save, selectedListItem, showSelectedListItem } from "./state"
import { List, ListItem } from "./types"

export const loadLists = () => {
  const data = localStorage.getItem("lists")
  if (data) {
    try {
      const res = JSON.parse(data) as List[]

      return res.map((list) => createSignal(list))
    } catch (error) {
      console.error("failed to parse locally saved lists", error)
    }
  }
  return []
}

export const addList = () => {
  const newList = createSignal({
    id: Date.now().toString(),
    title: "",
    items: [] as ListItem[],
    archived: false,
  })
  newList.subscribe(() => save())
  lists.value.push(newList)
  lists.notify()
}

export const removeList = (id: string) => {
  lists.value = lists.value.filter((list) => list.value.id !== id)
}

export const archiveList = (id: string) => {
  const list = lists.value.find((list) => list.value.id === id)
  if (list) {
    list.value.archived = true
    list.notify()
  }
}

export const addListItem = (listId: string) => {
  const list = lists.value.find((list) => list.value.id === listId)
  if (list) {
    list.value.items.push({
      id: Date.now().toString(),
      title: "",
      archived: false,
      description: "",
      refereceItems: [],
    })
    list.notify()
  }
}

export const removeListItem = (listId: string, itemId: string) => {
  const list = lists.value.find((list) => list.value.id === listId)
  if (list) {
    list.value.items = list.value.items.filter((item) => item.id !== itemId)
    list.notify()
    selectedListItem.value = null
    showSelectedListItem.value = false
  }
}

export const archiveListItem = (listId: string, itemId: string) => {
  const list = lists.value.find((list) => list.value.id === listId)
  if (list) {
    const item = list.value.items.find((item) => item.id === itemId)
    if (item) {
      item.archived = true
      list.notify()
      selectedListItem.value = null
      showSelectedListItem.value = false
    }
  }
}

export const selectListItem = (listId: string, itemId: string) => {
  const list = lists.value.find((list) => list.value.id === listId)
  if (list) {
    const item = list.value.items.find((item) => item.id === itemId)
    if (item) {
      selectedListItem.value = { ...item, listId }
    }
    showSelectedListItem.value = true
  }
}
