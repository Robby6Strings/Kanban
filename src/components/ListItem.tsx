import { selectListItem } from "../state"
import { type ListItem as ListItemData } from "../types"

export const ListItem = ({ item, listId }: { item: ListItemData; listId: number }) => {
  return (
    <button key={item.id} className="list-item" onclick={() => selectListItem(item, listId)}>
      {item.title || "New Item"}
    </button>
  )
}
