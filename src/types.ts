import { type Signal } from "cinnabun"

export type ReactiveListboard = {
  id: number
  title: string
  lists: Signal<List | null>[]
  archived: boolean
  created: Date
}

export type ListBoard = {
  id: number
  title: string
  lists: List[]
  archived: boolean
  created: Date
}

export type List = {
  id: number
  title: string
  items: ListItem[]
  archived: boolean
  created: Date
}

export type ListItem = {
  id: number
  title: string
  description: string
  refereceItems: number[]
  archived: boolean
  created: Date
}
