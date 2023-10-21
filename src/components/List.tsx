import "./List.css"
import type { List as ListData, ReactiveList } from "../types"
import { ListItem } from "./ListItem"
import { Signal, createSignal } from "cinnabun"
import { ClickOutsideListener } from "cinnabun/listeners"
import { MoreIcon } from "./icons/MoreIcon"
import { boards } from "../state"
import { addItem, archiveList, deleteList } from "../db"

export const List = ({ list }: { list: Signal<ReactiveList> }) => {
  const actionsOpen = createSignal(false)
  const changeTitle = (e: Event) => {
    if (!list.value) return
    list.value.title = (e.target as HTMLInputElement).value
    list.notify()
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
              <button type="button" onclick={() => deleteList(list.value!)}>
                Delete list
              </button>
              <button type="button" onclick={() => archiveList(list.value!)}>
                Archive list
              </button>
            </div>
          </ClickOutsideListener>
        </div>
      </div>
      <div className="list-items">
        <div className="list-items-inner" watch={list} bind:children>
          {() =>
            list.value.items.value?.map((item) => (
              <ListItem item={item} listId={list.value!.id} />
            ))
          }
          <div
            watch={boards}
            className="list-item default"
            bind:visible={() => list.value?.items.value?.length === 0}
          >
            <i>No items yet</i>
          </div>
        </div>
      </div>
      <div className="list-footer">
        <button
          type="button"
          className="add-list-item"
          onclick={() => addItem(list.value!.id)}
        >
          + Add another card
        </button>
      </div>
    </div>
  )
}
