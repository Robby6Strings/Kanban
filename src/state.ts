import { createSignal, useComputed } from "cinnabun"
import { loadLists, saveState } from "./list"
import { ListItem } from "./types"

export const lists = createSignal(loadLists())
console.log(lists.value)

lists.subscribe(saveState)

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
