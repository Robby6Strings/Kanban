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
  selectListItem,
  updateList,
} from "../state"

export const ItemList = ({ list }: { list: Signal<ReactiveList> }) => {
  const dropAreaRef = useRef()

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
            template={(item) => <ListItemButton item={item} />}
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

const ListItemButton = ({ item }: { item: ListItem }) => {
  const btnRef = useRef()
  return (
    <button
      ref={btnRef}
      key={item.id}
      className="list-item"
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
      watch={[clickedItem]}
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
