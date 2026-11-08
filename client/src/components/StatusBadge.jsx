// Coloured label for a request status: pending / accepted / rejected / completed
function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{status}</span>
}

export default StatusBadge
