import "./List.css"
import type { List as ListData } from "../types"
import { ListItem } from "./ListItem"
import { For, createSignal } from "cinnabun"
import { ClickOutsideListener } from "cinnabun/listeners"
import { addListItem, archiveList, lists, removeList } from "../state"
import { MoreIcon } from "./icons/MoreIcon"

export const List = ({ list }: { list: ListData }) => {
  const actionsOpen = createSignal(false)
  const changeTitle = (e: Event) => {
    list.title = (e.target as HTMLInputElement).value
    lists.notify()
  }

  return (
    <div key={list.id} className="list">
      <div className="list-header">
        <input
          placeholder="Name this list..."
          className="list-title"
          onchange={changeTitle}
          value={list.title}
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
              <button type="button" onclick={() => removeList(list.id)}>
                Delete list
              </button>
              <button type="button" onclick={() => archiveList(list.id)}>
                Archive list
              </button>
            </div>
          </ClickOutsideListener>
        </div>
      </div>
      <div className="list-items">
        <div className="list-items-inner">
          <For each={list.items} template={(item) => <ListItem item={item} listId={list.id} />} />
          <div
            watch={lists}
            className="list-item default"
            bind:visible={() => list.items.length === 0}
          >
            <i>No items yet</i>
          </div>
          <button type="button" className="add-list-item" onclick={() => addListItem(list.id)}>
            + Add another card
          </button>
        </div>
      </div>
    </div>
  )
}
