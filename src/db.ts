import { idb, model, Field } from "async-idb-orm"
import { List, ListItem, ReactiveListboard } from "./types"
import { Signal } from "cinnabun"
import { asyncSignal, selectedBoard } from "./state"

const items = model({
  id: Field.number({ primaryKey: true }),
  title: Field.string(),
  created: Field.date({ default: () => new Date() }),
  archived: Field.boolean({ default: () => false }),
  refereceItems: Field.array(Field.number()),
})

const lists = model({
  id: Field.number({ primaryKey: true }),
  title: Field.string(),
  created: Field.date({ default: () => new Date() }),
  archived: Field.boolean({ default: () => false }),
  items: Field.array(Field.number()),
})

const boards = model({
  id: Field.number({ primaryKey: true }),
  title: Field.string(),
  created: Field.date({ default: () => new Date() }),
  archived: Field.boolean({ default: () => false }),
  lists: Field.array(Field.number()),
})

const db = idb("kanban", { boards, lists, items })

export const loadBoards = async (): Promise<ReactiveListboard[]> => {
  const boards = await db.boards.all()
  return boards.map((board) => ({
    id: board.id,
    title: board.title,
    created: board.created,
    archived: board.archived,
    lists: board.lists.map((list) => asyncSignal(db.lists.read(list)) as Signal<List | null>),
  }))
}

export const updateBoard = async (board: ReactiveListboard) => {
  return await db.boards.update({
    id: board.id,
    title: board.title,
    created: board.created,
    archived: board.archived,
    lists: board.lists.map((list) => list.value?.id ?? 0),
  })
}

export const addBoard = async () => {
  const board = await db.boards.create({
    title: "",
    created: new Date(),
    archived: false,
    lists: [],
  })
  if (!board) throw new Error("Board not created")
  return {
    ...board,
    lists: board.lists.map((list) => asyncSignal(db.lists.read(list)) as Signal<List | null>),
  } as ReactiveListboard
}

export const updateList = async (list: List) => {
  return await db.lists.update({
    id: list.id,
    title: list.title,
    created: list.created,
    archived: list.archived,
    items: list.items.map((item) => item.id),
  })
}

export const addList = async () => {
  const list = await db.lists.create({
    title: "",
    created: new Date(),
    archived: false,
    items: [],
  })
  if (!list) throw new Error("List not created")
  const board = await db.boards.read(selectedBoard.value!.id)
  if (!board) throw new Error("Board not found")
  await db.boards.update({ ...board, lists: [...board.lists, list.id] })
}

export const updateItem = async (item: ListItem) => {
  return db.items.update(item)
}

export const addItem = async (listId: number) => {
  const item = await db.items.create({
    title: "",
    created: new Date(),
    archived: false,
    refereceItems: [],
  })
  if (!item) return
  const list = await db.lists.read(listId)
  if (!list) return
  await db.lists.update({ ...list, items: [...list.items, item.id] })
}

export const deleteItem = async (item: ListItem) => {
  return await db.items.delete(item.id)
}

export const deleteList = async (list: List) => {
  return await db.lists.delete(list.id)
}

export const deleteBoard = async (board: ReactiveListboard) => {
  return await db.boards.delete(board.id)
}

export const archiveItem = async (item: ListItem) => {
  return await db.items.update({ ...item, archived: true })
}

export const archiveList = async (list: List) => {
  return await db.lists.update({
    ...list,
    archived: true,
    items: list.items.map((item) => item.id),
  })
}

export const archiveBoard = async (board: ReactiveListboard) => {
  return await db.boards.update({
    ...board,
    archived: true,
    lists: board.lists.map((list) => list.value?.id ?? 0),
  })
}
