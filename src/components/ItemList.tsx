import "./ItemList.css"
import type { ListItem, ReactiveList } from "../types"
import { Component, For, Signal, createSignal, useRef } from "cinnabun"
import { ClickOutsideListener } from "cinnabun/listeners"
import { MoreIcon } from "./icons/MoreIcon"
import {
  addListItem,
  archiveList,
  clickedItem,
  deleteList,
  listItemDragTarget,
  selectListItem,
  updateList,
} from "../state"

export const ItemList = ({ list }: { list: Signal<ReactiveList> }) => {
  const dropAreaComponentRef = createSignal<Component | null>(null)

  const handleListMouseMove = (e: MouseEvent) => {
    if (!dropAreaComponentRef.value) return
    if (!clickedItem.value || !clickedItem.value.dragging) {
      listItemDragTarget.value = null
      return
    }
    if (!list.value) return

    // find the closest item to the mouse
    const elements = (
      dropAreaComponentRef.value.children[0]! as Component
    ).children
      .filter((c) => (c as Component).props.key !== clickedItem.value?.id)
      .map((c) => (c as Component).element as HTMLElement)

    const isOriginList = clickedItem.value.listId === list.value.id

    let index: number = elements.length

    const draggedItemTop = e.clientY - clickedItem.value.mouseOffset.y

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i] as HTMLElement
      const rect = element.getBoundingClientRect()
      if (draggedItemTop < rect.top) {
        index = i
        break
      }
    }

    if (isOriginList) {
      if (clickedItem.value.index <= index) index++
    }

    listItemDragTarget.value = { index, listId: list.value.id }
  }

  const actionsOpen = createSignal(false)
  const changeTitle = (e: Event) => {
    if (!list.value) return
    list.value.title = (e.target as HTMLInputElement).value
    return updateList(list.value)
  }

  return (
    <div key={list.value?.id} className="list">
      <div className="list-header">
        <input
          placeholder="Name this list..."
          className="list-title"
          onchange={changeTitle}
          watch={list}
          bind:value={() => list.value?.title}
        />

        <div className="list-actions">
          <ClickOutsideListener
            tag="div"
            onCapture={() => (actionsOpen.value = false)}
          >
            <button
              className="icon-button"
              type="button"
              onclick={() => (actionsOpen.value = !actionsOpen.value)}
            >
              <MoreIcon />
            </button>
            <div
              watch={actionsOpen}
              className="list-actions-menu"
              bind:visible={() => actionsOpen.value}
            >
              <button type="button" onclick={() => deleteList(list.value!.id)}>
                Delete list
              </button>
              <button type="button" onclick={() => archiveList(list.value!.id)}>
                Archive list
              </button>
            </div>
          </ClickOutsideListener>
        </div>
      </div>
      <div
        watch={listItemDragTarget}
        bind:className={() =>
          `list-items ${
            listItemDragTarget.value?.listId === list.value.id ? "dragging" : ""
          } ${
            listItemDragTarget.value?.index === list.value.items.value.length
              ? "last"
              : ""
          }`
        }
      >
        <div
          onMounted={(self) => {
            dropAreaComponentRef.value = self
            const el = self.element as HTMLElement
            el.addEventListener("mousemove", handleListMouseMove)
            el.addEventListener(
              "mouseleave",
              () => (listItemDragTarget.value = null)
            )
          }}
          className="list-items-inner"
          watch={list}
          bind:children
        >
          <For
            each={list.value.items}
            template={(item, idx) => <ListItemButton item={item} idx={idx} />}
          />

          <div
            watch={[listItemDragTarget, list.value.items]}
            bind:visible={() =>
              !list.value.items.value || list.value.items.value.length === 0
            }
            bind:className={() =>
              `list-item default ${
                listItemDragTarget.value?.listId === list.value?.id
                  ? "drop-target"
                  : ""
              }`
            }
          >
            <i>No items yet</i>
          </div>
        </div>
      </div>
      <div className="list-footer">
        <button
          type="button"
          className="add-list-item btn-primary"
          onclick={() => addListItem(list.value!.id)}
        >
          + Add another card
        </button>
      </div>
    </div>
  )
}

const ListItemButton = ({ item, idx }: { item: ListItem; idx: number }) => {
  const componentRef = createSignal<Component | null>(null)
  if (!item) return <></>
  return (
    <button
      onMounted={(self) => (componentRef.value = self)}
      onclick={() => selectListItem(item)}
      key={item.id}
      watch={[clickedItem, listItemDragTarget]}
      bind:visible={() =>
        !clickedItem.value ||
        !clickedItem.value.dragging ||
        clickedItem.value.id !== item.id
      }
      bind:className={() =>
        `list-item ${
          listItemDragTarget.value?.index === idx &&
          listItemDragTarget.value?.listId === item.listId
            ? "drop-target"
            : ""
        }`
      }
      onmousedown={(e: MouseEvent) => {
        clickedItem.value = {
          id: item.id,
          listId: item.listId,
          index: idx,
          dragging: false,
          element: componentRef.value!.element!.cloneNode(
            true
          ) as HTMLButtonElement,
          mouseOffset: {
            x: e.offsetX,
            y: e.offsetY,
          },
        }
      }}
    >
      {() => item.title || "New Item"}
    </button>
  )
}
