import "./List.css"
import type { List as ListData } from "../types"
import { ListItem } from "./ListItem"
import { For, Signal, createSignal } from "cinnabun"
import { ClickOutsideListener } from "cinnabun/listeners"
import { MoreIcon } from "./icons/MoreIcon"
import { removeList, archiveList, addListItem } from "../list"
import { lists } from "../state"

export const List = ({ list }: { list: Signal<ListData> }) => {
  const actionsOpen = createSignal(false)
  const changeTitle = (e: Event) => {
    list.value.title = (e.target as HTMLInputElement).value
    list.notify()
  }

  return (
    <div key={list.value.id} className="list">
      <div className="list-header">
        <input
          placeholder="Name this list..."
          className="list-title"
          onchange={changeTitle}
          watch={list}
          bind:value={() => list.value.title}
        />

        <div className="list-actions">
          <ClickOutsideListener tag="div" onCapture={() => (actionsOpen.value = false)}>
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
              <button type="button" onclick={() => removeList(list.value.id)}>
                Delete list
              </button>
              <button type="button" onclick={() => archiveList(list.value.id)}>
                Archive list
              </button>
            </div>
          </ClickOutsideListener>
        </div>
      </div>
      <div className="list-items">
        <div className="list-items-inner" watch={list} bind:children>
          {() => list.value.items.map((item) => <ListItem item={item} listId={list.value.id} />)}
          <div
            watch={lists}
            className="list-item default"
            bind:visible={() => list.value.items.length === 0}
          >
            <i>No items yet</i>
          </div>
        </div>
      </div>
      <div className="list-footer">
        <button type="button" className="add-list-item" onclick={() => addListItem(list.value.id)}>
          + Add another card
        </button>
      </div>
    </div>
  )
}
