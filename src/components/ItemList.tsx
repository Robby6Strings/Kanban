import "./ItemList.css"
import type { ListItem, ReactiveList } from "../types"
import { For, Signal, createSignal, useRef } from "cinnabun"
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
  const dropAreaRef = useRef()

  const handleListMouseOver = (e: MouseEvent) => {
    if (!dropAreaRef.value) return
    if (!clickedItem.value || !clickedItem.value.dragging) {
      listItemDragTarget.value = null
      return
    }
    if (!list.value) return

    const evt = e as MouseEvent
    // find the closest item to the mouse
    const elements = Array.from(dropAreaRef.value.children) || []
    let closestDistance = Infinity
    let index: number | null = null
    let side: "top" | "bottom" = "bottom"

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i]
      const itemRect = element.getBoundingClientRect()
      const distance = Math.sqrt(
        Math.pow(itemRect.x - evt.clientX, 2) +
          Math.pow(itemRect.y - evt.clientY, 2)
      )
      if (distance < closestDistance) {
        index = i
        side = evt.clientY < itemRect.y + itemRect.height / 2 ? "top" : "bottom"
        closestDistance = distance
      }
    }

    if (index === null) {
      listItemDragTarget.value = null
      return
    }

    if (
      listItemDragTarget.value?.index === index &&
      listItemDragTarget.value?.side === side
    )
      return

    listItemDragTarget.value = { index, side }
  }

  dropAreaRef.subscribe((el) => {
    if (!el) return
    ;(el as HTMLElement).addEventListener("mousemove", handleListMouseOver)
  })

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
      <div className="list-items">
        <div
          ref={dropAreaRef}
          className="list-items-inner"
          watch={list}
          bind:children
        >
          <For
            each={list.value.items}
            template={(item, idx) => <ListItemButton item={item} idx={idx} />}
          />

          {() =>
            !list.value.items.value || list.value.items.value.length === 0 ? (
              <div className="list-item default">
                <i>No items yet</i>
              </div>
            ) : (
              <></>
            )
          }
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
  const btnRef = useRef()
  return (
    <button
      ref={btnRef}
      key={item.id}
      bind:className={() =>
        `list-item ${
          listItemDragTarget.value?.index === idx
            ? `drop-target ${listItemDragTarget.value?.side}`
            : ""
        }`
      }
      onclick={() => selectListItem(item)}
      onmousedown={(e: MouseEvent) =>
        (clickedItem.value = {
          id: item.id,
          dragging: false,
          element: btnRef.value!.cloneNode(true) as HTMLButtonElement,
          mouseOffset: {
            x: e.offsetX,
            y: e.offsetY,
          },
        })
      }
      //onmouseup={() => (clickedItem.value = null)}
      watch={[clickedItem, listItemDragTarget]}
      bind:visible={() =>
        !clickedItem.value ||
        !clickedItem.value.dragging ||
        clickedItem.value.id !== item.id
      }
    >
      {() => item.title || "New Item"}
    </button>
  )
}
