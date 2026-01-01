import { ParcelStatus } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ParcelStatus;
  className?: string;
}

const statusConfig: Record<ParcelStatus, { label: string; class: string; icon: string }> = {
  requested: {
    label: 'Requested',
    class: 'status-requested',
    icon: 'fa-clock',
  },
  accepted: {
    label: 'Accepted',
    class: 'status-accepted',
    icon: 'fa-check',
  },
  'in-transit': {
    label: 'In Transit',
    class: 'status-in-transit',
    icon: 'fa-truck',
  },
  delivered: {
    label: 'Delivered',
    class: 'status-delivered',
    icon: 'fa-check-double',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span className={cn('status-badge', config.class, className)}>
      <i className={cn('fas', config.icon, 'mr-1.5 text-[10px]')}></i>
      {config.label}
    </span>
  );
}
