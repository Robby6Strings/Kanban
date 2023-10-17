import { type ListItem as ListItemData } from "../types"

export const ListItem = ({ item }: { item: ListItemData }) => {
  return (
    <button key={item.id} className="list-item">
      {item.title || <i>New Item</i>}
    </button>
  )
}
