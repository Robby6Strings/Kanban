import "./ItemList.css"
import type { ListItem, ReactiveList } from "../types"
import { Component, For, Signal, createSignal, useRef } from "cinnabun"
import {
  addListItem,
  clickedItem,
  clickedList,
  listDragTarget,
  listItemDragTarget,
  selectListItem,
  updateList,
} from "../state"
import { EditIcon } from "./icons/EditIcon"
import { KeyboardListener } from "cinnabun/listeners"

export const ItemList = ({ list }: { list: Signal<ReactiveList> }) => {
  const componentRef = createSignal<Component | null>(null)
  const dropAreaComponentRef = createSignal<Component | null>(null)
  const isEditingTitle = createSignal(false)
  const inputRef = useRef()

  const handleListMouseMove = (e: MouseEvent) => {
    if (!list.value) return
    if (!dropAreaComponentRef.value) return
    if (!clickedItem.value) {
      listItemDragTarget.value = null
      return
    }

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

  const handleListTitleFocus = (e: Event) => {
    if (isEditingTitle.value) {
      return
    }
    e.preventDefault()
    e.stopImmediatePropagation()
    ;(e.target as HTMLInputElement).blur()

    console.log("asdasdasdasd")
  }

  const changeTitle = async (e: Event) => {
    if (!list.value) return
    const input = e.target as HTMLInputElement
    list.value.title = input.value
    await updateList(list.value)
    input.blur()
  }

  return (
    <div
      key={list.value.id}
      onMounted={(self) => (componentRef.value = self)}
      onmousedown={(e: MouseEvent) => {
        if (e.target !== inputRef.value) return
        // the offset we get is of the input so we need to add the padding
        const padding = parseInt(
          getComputedStyle(componentRef.value?.element!).padding
        )
        clickedList.value = {
          id: list.value.id,
          index: list.value.order,
          dragging: false,
          element: componentRef.value!.element!.cloneNode(
            true
          ) as HTMLButtonElement,
          mouseOffset: {
            x: e.offsetX + padding,
            y: e.offsetY + padding,
          },
        }
      }}
      watch={[clickedList, listDragTarget]}
      bind:visible={() =>
        !clickedList.value ||
        !clickedList.value.dragging ||
        clickedList.value.id !== list.value.id
      }
      bind:className={() =>
        `list ${
          listDragTarget.value?.index === list.value.order ? "drop-target" : ""
        }`
      }
    >
      <div className="list-header">
        <KeyboardListener
          keys={["Escape"]}
          onCapture={(_, e) => {
            ;(e.target as HTMLInputElement)?.blur()
            isEditingTitle.value = false
          }}
        />
        <input
          ref={inputRef}
          placeholder="Name this list..."
          className="list-title"
          onchange={changeTitle}
          onblur={() => (isEditingTitle.value = false)}
          watch={[list, isEditingTitle]}
          bind:value={() => list.value?.title}
          bind:tabIndex={() => (isEditingTitle.value ? "0" : "-1")}
          bind:className={() =>
            isEditingTitle.value ? "list-title editing" : "list-title"
          }
          onfocus={handleListTitleFocus}
        />
        <button
          watch={isEditingTitle}
          bind:visible={() => !isEditingTitle.value}
          onclick={() => {
            isEditingTitle.value = !isEditingTitle.value
            if (isEditingTitle.value) {
              ;(inputRef.value as HTMLInputElement)?.focus()
            }
          }}
          className="icon-button"
          type="button"
        >
          <EditIcon />
        </button>
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
