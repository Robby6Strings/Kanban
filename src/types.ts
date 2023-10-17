export type List = {
  id: string
  title: string
  items: ListItem[]
  archived: boolean
}

export type ListItem = {
  id: string
  title: string
  description: string
  refereceItems: string[]
  archived: boolean
}
