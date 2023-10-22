import { Board } from "./components/Board"
import { ItemModal } from "./components/ItemModal"
import { BoardSelector } from "./components/BoardSelector"
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
          <BoardSelector />
        </nav>
        <Board />
        <ItemModal />
      </main>
    </>
  )
}
