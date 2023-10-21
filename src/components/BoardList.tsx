import "./BoardList.css"
import { addBoard } from "../db"
import { boards, selectBoard, selectedBoard } from "../state"
import { ListBoard } from "../types"

export const BoardList = () => {
  const createBoard = async () => {
    const newBoard = await addBoard()
    boards.value?.splice(0, 0, newBoard)
    boards.notify()
    selectBoard(newBoard)
    console.log(boards.value)
  }
  return (
    <div id="board-list">
      <div className="board-list-header">
        <h3>Board List</h3>
      </div>
      <div id="add-board">
        <button type="button" className="btn-primary" onclick={createBoard}>
          Create a board...
        </button>
      </div>

      <div className="board-list-items">
        <div watch={boards} bind:children className="board-list-items-inner">
          {() => boards.value?.map((board) => <BoardListItem board={board} />)}
        </div>
      </div>
    </div>
  )
}

const BoardListItem = ({ board }: { board: ListBoard }) => {
  return (
    <div className="board-list-item">
      <button
        watch={selectedBoard}
        bind:className={() =>
          selectedBoard.value?.id === board.id
            ? "board-list-item-button btn-primary"
            : "board-list-item-button"
        }
        onclick={() => selectBoard(board)}
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
