import { Board } from "./components/Board"
import { ListItemModal } from "./components/ListItemModal"
import { BoardList } from "./components/BoardList"

export const App = () => {
  return (
    <>
      <main>
        <nav className="nav">
          <BoardList />
        </nav>
        <Board />
        <ListItemModal />
      </main>
    </>
  )
}
