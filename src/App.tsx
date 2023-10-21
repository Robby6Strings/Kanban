import { ListBoard } from "./components/ListBoard"
import { Header } from "./components/Header"
import { ListItemModal } from "./components/ListItemModal"
import { BoardList } from "./components/BoardList"

export const App = () => {
  return (
    <>
      <Header />
      <main>
        <nav className="nav">
          <BoardList />
        </nav>
        <ListBoard />
        <ListItemModal />
      </main>
    </>
  )
}
