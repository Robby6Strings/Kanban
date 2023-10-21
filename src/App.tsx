import { Board } from "./components/Board"
import { ItemModal } from "./components/ItemModal"
import { BoardList } from "./components/BoardList"
import { mousePos } from "./state"

export const App = () => {
  return (
    <>
      <main
        onmousemove={(e: MouseEvent) => {
          mousePos.value = { x: e.clientX, y: e.clientY }
        }}
      >
        <nav className="nav">
          <BoardList />
        </nav>
        <Board />
        <ItemModal />
      </main>
    </>
  )
}
