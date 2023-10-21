import { type Signal } from "cinnabun"

export type ReactiveListboard = ListBoard & {
  lists: Signal<ReactiveList>[]
}

export type ReactiveList = List & {
  items: Signal<ListItem[]>
}

export type ListBoard = {
  id: number
  title: string
  archived: boolean
  created: Date
}

export type List = {
  id: number
  boardId: number
  title: string
  archived: boolean
  created: Date
}

export type ListItem = {
  id: number
  listId: number
  title: string
  description: string
  refereceItems: number[]
  archived: boolean
  created: Date
  dragging?: boolean
}
