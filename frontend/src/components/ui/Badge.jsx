import { formatOrderStatus, getStatusColor } from '../../utils/formatters';

export default function Badge({ status, text }) {
  const displayText = text || formatOrderStatus(status);
  const colorClass = getStatusColor(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {displayText}
    </span>
  );
}
