import { createSignal } from "cinnabun"
import { ClickOutsideListener } from "cinnabun/listeners"
import { lists, selectedListItem, showSelectedListItem } from "../state"
import { MoreIcon } from "./icons/MoreIcon"
import { Modal, ModalHeader } from "./modal/Modal"
import { removeListItem, archiveListItem } from "../list"

export const ListItemModal = () => {
  const actionsOpen = createSignal(false)
  const changeTitle = (e: Event) => {
    if (!selectedListItem.value) return

    const listItem = lists.value
      .find((list) => list.id === selectedListItem.value!.listId)
      ?.items.find((item) => item.id === selectedListItem.value!.id)
    if (!listItem) return

    listItem.title = (e.target as HTMLInputElement).value
    lists.notify()
  }
  return (
    <Modal
      toggle={() => (showSelectedListItem.value = false)}
      visible={() => showSelectedListItem.value}
      watch={showSelectedListItem}
      onUnmount={() => (selectedListItem.value = null)}
      onclose={() => (actionsOpen.value = false)}
    >
      <ModalHeader>
        <input
          placeholder="Name this item..."
          className="list-title"
          onchange={changeTitle}
          watch={selectedListItem}
          bind:value={() => selectedListItem.value?.title || ""}
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
              className="list-actions-menu"
              watch={actionsOpen}
              bind:visible={() => actionsOpen.value}
            >
              <button
                type="button"
                onclick={() =>
                  removeListItem(selectedListItem.value!.listId, selectedListItem.value!.id)
                }
              >
                Delete item
              </button>
              <button
                type="button"
                onclick={() =>
                  archiveListItem(selectedListItem.value!.listId, selectedListItem.value!.id)
                }
              >
                Archive item
              </button>
            </div>
          </ClickOutsideListener>
        </div>
      </ModalHeader>
    </Modal>
  )
}
