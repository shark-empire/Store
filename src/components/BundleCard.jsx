import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import NetworkBadge from './NetworkBadge';
import { networkColors } from '../utils/constants';
import { ghs } from '../utils/helpers';

export default function BundleCard({ bundle, onBuyClick }) {
  const navigate = useNavigate();
  const nc = networkColors[bundle.network];

  const handleClick = () => {
    if (onBuyClick) { onBuyClick(bundle); return; }
    navigate(`/bundle/${bundle.id}`);
  };

  return (
    <div className="card-base overflow-hidden group cursor-pointer" onClick={handleClick}>
      <div className="h-[3px] w-full" style={{ background: `linear-gradient(90deg, ${nc.text}, ${nc.text}88)` }} />
      <div className="relative h-40 overflow-hidden" style={{ background: `linear-gradient(135deg, ${nc.bg}, ${nc.lightBg})` }}>
        {bundle.image && (
<img 
  src={nc.logo} 
  alt={bundle.network} 
  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
/>
        )}
        <div className="absolute top-3 right-3"><NetworkBadge network={bundle.network} size="sm" /></div>
      </div>
      <div className="p-5">
        <h3 className="font-syne font-bold text-base text-[#F0F6FF] mb-1">{bundle.name}</h3>
        <p className="font-dm text-[13px] text-[#94A3B8] mb-3">{bundle.size} · {bundle.validity}</p>
        <div className="flex items-baseline justify-between mb-3">
          <span className="font-syne font-extrabold text-2xl text-[#22D3A1]">{ghs(bundle.price)}</span>
        </div>
        <p className="font-dm text-xs text-[#64748B] mb-4">Sold by <span className="text-[#94A3B8]">{bundle.vendorName}</span></p>
        <button className="w-full btn-primary py-3 text-sm rounded-[10px]" onClick={(e) => { e.stopPropagation(); handleClick(); }}>
          <ShoppingCart className="w-4 h-4" /> Buy Now
        </button>
      </div>
    </div>
  );
}
