import { Signal, TowerControl, Smartphone } from 'lucide-react';
import { networkColors } from '../utils/constants';

const networkIcons = {
  MTN:     <Signal       className="w-3.5 h-3.5" />,
  Telecel: <TowerControl className="w-3.5 h-3.5" />,
  AT:      <Smartphone   className="w-3.5 h-3.5" />,
};

const badgeSizes = {
  sm: 'px-2 py-0.5 text-[11px] gap-1',
  md: 'px-3 py-1 text-[13px] gap-1.5',
  lg: 'px-4 py-1.5 text-sm gap-2',
};

export default function NetworkBadge({ network, size = 'md' }) {
  const c = networkColors[network];
  return (
    <span
      className={`inline-flex items-center font-dm font-semibold rounded-full ${badgeSizes[size]}`}
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}
    >
      {networkIcons[network]} {network}
    </span>
  );
}
