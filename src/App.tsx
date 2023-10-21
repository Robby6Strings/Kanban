import { Board } from "./components/Board"
import { ItemModal } from "./components/ItemModal"
import { BoardList } from "./components/BoardList"

export const App = () => {
  return (
    <>
      <main>
        <nav className="nav">
          <BoardList />
        </nav>
        <Board />
        <ItemModal />
      </main>
    </>
  )
}
