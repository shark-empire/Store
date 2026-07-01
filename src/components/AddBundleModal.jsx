import { useState } from 'react'; // Ensure useState is imported
import { createBundle } from '../api/dataPulseApi';

export default function AddBundleModal({ storeId, onRefresh }) {
  // 1. Initialized with MTN, but now the user can change it
  const [data, setData] = useState({ name: '', price: '', sizeGb: '', network: 'MTN' });

  const handleSubmit = async () => {
    // This now sends the selected network (e.g., 'Telecel' or 'AT') to your database
    await createBundle({ ...data, storeId }); 
    onRefresh(); 
  };

  return (
    <div className="p-6 bg-surface border rounded-xl flex flex-col gap-4">
      <input 
        placeholder="Bundle Name" 
        className="input-base" 
        onChange={(e) => setData({...data, name: e.target.value})} 
      />
      
      {/* 2. Added Network Dropdown */}
      <select 
        className="input-base" 
        value={data.network} 
        onChange={(e) => setData({...data, network: e.target.value})}
      >
        <option value="MTN">MTN</option>
        <option value="Telecel">Telecel</option>
        <option value="AT">AT</option>
      </select>

      <input 
        placeholder="Price" 
        type="number" 
        className="input-base" 
        onChange={(e) => setData({...data, price: e.target.value})} 
      />
      
      <button onClick={handleSubmit} className="btn-primary">Add Package</button>
    </div>
  );
}
