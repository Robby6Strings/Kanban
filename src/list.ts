import { List } from "./types"

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
