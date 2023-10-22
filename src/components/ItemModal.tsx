import { createSignal } from "cinnabun"
import { ClickOutsideListener } from "cinnabun/listeners"
import {
  archiveListItem,
  deleteListItem,
  selectedListItem,
  showSelectedListItem,
  updateListItem,
} from "../state"
import { MoreIcon } from "./icons/MoreIcon"
import { Modal, ModalBody, ModalHeader } from "./modal/Modal"

export const ItemModal = () => {
  const actionsOpen = createSignal(false)
  const changeTitle = (e: Event) => {
    if (!selectedListItem.value) return

    selectedListItem.value.title = (e.target as HTMLInputElement).value
    updateListItem(selectedListItem.value)
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
          oninput={changeTitle}
          watch={selectedListItem}
          bind:value={() => selectedListItem.value?.title || ""}
          onMounted={(self) => {
            if (!selectedListItem.value?.title) {
              self.element!.focus()
            }
          }}
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
              className="list-actions-menu"
              watch={actionsOpen}
              bind:visible={() => actionsOpen.value}
            >
              <button
                type="button"
                onclick={() =>
                  deleteListItem(selectedListItem.value!).then(
                    () => (showSelectedListItem.value = false)
                  )
                }
              >
                Delete item
              </button>
              <button
                type="button"
                onclick={() =>
                  archiveListItem(selectedListItem.value!).then(
                    () => (showSelectedListItem.value = false)
                  )
                }
              >
                Archive item
              </button>
            </div>
          </ClickOutsideListener>
        </div>
      </ModalHeader>
      <ModalBody>
        <div className="list-item-description">
          <textarea
            placeholder="Add a description..."
            oninput={(e: KeyboardEvent) => {
              if (!selectedListItem.value) return

              selectedListItem.value.description = (
                e.target as HTMLTextAreaElement
              ).value
              updateListItem(selectedListItem.value)
            }}
            watch={selectedListItem}
            bind:value={() => selectedListItem.value?.description || ""}
          />
        </div>
      </ModalBody>
    </Modal>
  )
}
