import { selectListItem } from "../state"
import { type ListItem as ListItemData } from "../types"

export const ListItem = ({ item, listId }: { item: ListItemData; listId: string }) => {
  return (
    <button key={item.id} className="list-item" onclick={() => selectListItem(listId, item.id)}>
      {item.title || <i>New Item</i>}
    </button>
  )
}
