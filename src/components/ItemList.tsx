import "./ItemList.css"
import type { ListItem, ReactiveList } from "../types"
import { Component, For, Signal, createSignal, useRef } from "cinnabun"
import {
  addListItem,
  clickedItem,
  clickedList,
  itemClone,
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
  const handleRef = useRef()
  const headerRef = useRef()

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

    let index = elements.length

    const draggedItemTop = e.clientY - clickedItem.value.mouseOffset.y

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i] as HTMLElement
      const rect = element.getBoundingClientRect()
      if (draggedItemTop < rect.top) {
        index = i
        break
      }
    }

    if (isOriginList && clickedItem.value.index <= index) {
      index++
    }

    listItemDragTarget.value = { index, listId: list.value.id, initial: false }
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
        if (!headerRef.value?.contains(e.target as HTMLElement)) return
        const padding = parseInt(getComputedStyle(headerRef.value!).padding)
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
      onmousemove={() => {
        if (clickedItem.value && !clickedItem.value.dragging) {
          clickedItem.value.dragging = true
          clickedItem.notify()
          return
        }
      }}
      watch={[clickedList]}
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
      <div ref={headerRef} className="list-header">
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
          bind:visible={() => isEditingTitle.value}
          bind:value={() => list.value?.title}
          bind:className={() =>
            isEditingTitle.value ? "list-title editing" : "list-title"
          }
        />
        <h4
          ref={handleRef}
          className="list-title"
          watch={[list, isEditingTitle]}
          bind:visible={() => !isEditingTitle.value}
          bind:children
        >
          {() => list.value?.title || "Name this list..."}
        </h4>

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
        bind:className={() => {
          let className = `list-items`
          const isOriginList = clickedItem.value?.listId === list.value.id
          if (isOriginList) {
            className += " origin"
          }

          if (
            list.value.items.value.length === 0 ||
            (list.value.items.value.length === 1 && isOriginList)
          ) {
            className += " empty"
          }

          if (listItemDragTarget.value?.listId !== list.value.id)
            return className

          return `${className} ${clickedItem.value?.dragging ? "dragging" : ""} 
          ${listItemDragTarget.value?.initial ? "initial" : ""} 
          ${
            listItemDragTarget.value?.index === list.value.items.value.length
              ? "last"
              : ""
          }`.replace(/\s+/g, " ")
        }}
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
            template={(item, idx) => (
              <ListItemButton
                item={item}
                idx={idx}
                dropAreaRef={dropAreaComponentRef}
              />
            )}
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

const ListItemButton = ({
  item,
  idx,
  dropAreaRef,
}: {
  item: ListItem
  idx: number
  dropAreaRef: Signal<Component | null>
}) => {
  const componentRef = createSignal<Component | null>(null)
  const rect = createSignal<DOMRect | null>(null)
  if (!item) return <></>
  return (
    <button
      onMounted={(self) => {
        componentRef.value = self
        rect.value = self.element!.getBoundingClientRect()
      }}
      key={item.id}
      onclick={() => selectListItem(item)}
      watch={[clickedItem, listItemDragTarget]}
      bind:visible={() =>
        !clickedItem.value?.dragging || clickedItem.value.id !== item.id
      }
      bind:style={() => {
        if (!rect.value) return ""
        if (clickedItem.value?.id !== item.id) return ""
        // get the offset of the element from the drop area ref
        const dropAreaRect = dropAreaRef.value?.element?.getBoundingClientRect()
        if (!dropAreaRect) return ""
        const x = rect.value.x - dropAreaRect.x
        const y = rect.value.y - dropAreaRect.y
        return `transform: translate(calc(${x}px - .5rem), calc(${y}px - .5rem))`
      }}
      bind:className={() =>
        `list-item ${
          listItemDragTarget.value?.index === idx &&
          listItemDragTarget.value?.listId === item.listId
            ? "drop-target"
            : ""
        } ${clickedItem.value?.id === item.id ? "selected" : ""}`
      }
      onmousedown={(e: MouseEvent) => {
        const element = componentRef.value!.element!.cloneNode(
          true
        ) as HTMLButtonElement

        clickedItem.value = {
          id: item.id,
          listId: item.listId,
          index: idx,
          dragging: false,
          element,
          mouseOffset: {
            x: e.offsetX,
            y: e.offsetY,
          },
        }
        listItemDragTarget.value = {
          index: idx + 1,
          listId: item.listId,
          initial: true,
        }
        //itemClone.value = element
      }}
    >
      {() => item.title || "New Item"}
    </button>
  )
}
