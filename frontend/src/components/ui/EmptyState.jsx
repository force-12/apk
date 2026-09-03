import { HiOutlineInboxStack } from 'react-icons/hi2';
import { Link } from 'react-router-dom';

export default function EmptyState({ icon: Icon = HiOutlineInboxStack, title = 'Tidak ada data', description = '', actionLabel, actionTo }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="w-16 h-16 text-gray-300 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-4 max-w-sm">{description}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-primary text-sm">{actionLabel}</Link>
      )}
    </div>
  );
}
