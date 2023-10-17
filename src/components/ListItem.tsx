import { type ListItem as ListItemData } from "../types"

export const ListItem = ({ item }: { item: ListItemData }) => {
  return (
    <div key={item.id} className="list-item">
      {item.title}
    </div>
  )
}
