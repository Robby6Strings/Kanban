import { selectListItem } from "../state"
import { type ListItem as ListItemData } from "../types"

export const Item = ({ item }: { item: ListItemData }) => {
  return (
    <button
      key={item.id}
      className="list-item"
      onclick={() => selectListItem(item)}
    >
      {item.title || "New Item"}
    </button>
  )
}
