export default function StatCard({ tone, icon: Icon, label, value, sub }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <div className="stat-icon">
        <Icon />
      </div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}
