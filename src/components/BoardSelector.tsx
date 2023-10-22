import "./BoardSelector.css"
import { addBoard, updateBoard } from "../db"
import { boards, selectBoard, selectedBoard } from "../state"
import { ListBoard } from "../types"
import { createSignal } from "cinnabun"
import { ClickOutsideListener } from "cinnabun/listeners"
import { EditIcon } from "./icons/EditIcon"

const selectorOpen = createSignal(false)

export const BoardSelector = () => {
  const createBoard = async () => {
    const newBoard = await addBoard()
    boards.value?.splice(0, 0, newBoard)
    boards.notify()
    selectBoard(newBoard)
    selectorOpen.value = false
  }

  const handleEdit = async (e: Event) => {
    e.preventDefault()
    e.stopImmediatePropagation()

    if (selectedBoard.value) {
      const newTitle = prompt("Enter a new title for this board")
      if (newTitle) {
        selectedBoard.value.title = newTitle
        const board = boards.value?.find(
          (board) => board.id === selectedBoard.value?.id
        )
        if (!board) throw new Error("Board not found")
        board.title = newTitle
        await updateBoard(board)
        selectedBoard.notify()
      }
    }
  }

  return (
    <div id="board-list">
      <div className="board-list-header">
        <h3>Kranban</h3>
      </div>
      <ClickOutsideListener
        tag="div"
        className="board-list-selector"
        onCapture={() => (selectorOpen.value = false)}
      >
        <button
          type="button"
          className="btn "
          onclick={() => (selectorOpen.value = !selectorOpen.value)}
        >
          <span
            watch={selectedBoard}
            bind:children
            className="board-list-selector-title"
          >
            {() =>
              selectedBoard.value
                ? selectedBoard.value.title || "Unnamed board"
                : "Select a board"
            }
          </span>
          <button type="button" className="icon-button" onclick={handleEdit}>
            <EditIcon />
          </button>
        </button>
        <div
          watch={selectorOpen}
          bind:visible={() => selectorOpen.value}
          className="board-list-dropdown"
        >
          <div
            watch={boards}
            bind:children
            className="board-list-dropdown-body"
          >
            {() =>
              boards.value?.map((board) => <BoardListItem board={board} />)
            }
            <div className="board-list-item add-board">
              <button
                type="button"
                className="board-list-item-button btn-primary"
                onclick={createBoard}
              >
                <div className="board-list-item-title">Create new board</div>
              </button>
            </div>
          </div>
        </div>
      </ClickOutsideListener>
    </div>
  )
}

const BoardListItem = ({ board }: { board: ListBoard }) => {
  return (
    <div className="board-list-item">
      <button
        watch={selectedBoard}
        bind:visible={() => selectedBoard.value?.id !== board.id}
        bind:className={() =>
          selectedBoard.value?.id === board.id
            ? "board-list-item-button btn-primary"
            : "board-list-item-button"
        }
        onclick={() => {
          selectBoard(board)
          selectorOpen.value = false
        }}
        type="button"
        className="board-list-item-button"
      >
        <div className="board-list-item-title">
          {board.title || "New board"}
        </div>
      </button>
    </div>
  )
}
