import { IconEmptyPot } from './Icons'

export default function EmptyState({ title, message, action }) {
  return (
    <div className="empty-state">
      <IconEmptyPot />
      <h3>{title}</h3>
      <p>{message}</p>
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  )
}
