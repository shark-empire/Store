// Simplified example of how the form works
import { createBundle } from '../api/dataPulseApi';

export default function AddBundleModal({ storeId, onRefresh }) {
  const [data, setData] = useState({ name: '', price: '', sizeGb: '', network: 'MTN' });

  const handleSubmit = async () => {
    await createBundle({ ...data, storeId }); // Calls your API
    onRefresh(); // Refresh the list of bundles
  };

  return (
    <div className="p-6 bg-surface border rounded-xl">
      <input placeholder="Bundle Name" onChange={(e) => setData({...data, name: e.target.value})} className="input-base" />
      <input placeholder="Price" type="number" onChange={(e) => setData({...data, price: e.target.value})} className="input-base" />
      <button onClick={handleSubmit} className="btn-primary">Add Package</button>
    </div>
  );
}
