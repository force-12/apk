import { HiStar } from 'react-icons/hi2';

export default function Rating({ value = 0, size = 'sm' }) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map(star => (
        <HiStar key={star} className={`${sizeClass} ${star <= Math.round(value) ? 'text-amber-400' : 'text-gray-200'}`} />
      ))}
      <span className="text-sm text-gray-500 ml-1">({value})</span>
    </div>
  );
}
