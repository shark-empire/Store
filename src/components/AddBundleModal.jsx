export default function AddBundleModal({ storeId, onRefresh }) {
  // 1. Ensure the state matches the fields in your API
  const [data, setData] = useState({ 
    name: '', 
    price: '', 
    sizeGb: '', 
    network: 'MTN', // Default value
    validity: '24 Hours' 
  });

  const handleSubmit = async () => {
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
      
      {/* 2. Input/Select for Network */}
      <label className="text-sm text-gray-400">Select Network</label>
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
