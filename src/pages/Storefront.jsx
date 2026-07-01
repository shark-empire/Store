import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchStoreBySlug, fetchBundlesByStore, payDirectViaPaystack, createOrder } from '../api/dataPulseApi';
import { Loader2, ShoppingBag, CheckCircle, Smartphone } from 'lucide-react';

export default function Storefront() {
  const { slug } = useParams();
  const [store, setStore] = useState(null);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Checkout tracking states
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [customerPhone, setCustomerPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    async function loadStorefront() {
      const currentStore = await fetchStoreBySlug(slug);
      if (currentStore) {
        setStore(currentStore);
        const currentBundles = await fetchBundlesByStore(currentStore.id);
        setBundles(currentBundles);
      }
      setLoading(false);
    }
    loadStorefront();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050A14] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#38BDF8] animate-spin" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-[#050A14] flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl font-bold mb-2">Store Not Found</h1>
        <p className="text-gray-400">The storefront you are looking for does not exist.</p>
      </div>
    );
  }

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!selectedBundle || !customerPhone) return;
    setIsProcessing(true);

    try {
      // Execute explicit direct checkout call via Paystack inline modal
      const payment = await payDirectViaPaystack(selectedBundle, customerPhone, store.id, null);
      
      if (payment && payment.reference) {
        // Record order in backend against storeId without a required userId session
        await createOrder({
          bundleId: selectedBundle.id,
          storeId: store.id,
          customerPhone: customerPhone,
          amount: selectedBundle.price,
          paystackReference: payment.reference,
          paymentMethod: 'paystack'
        });

        setPaymentSuccess(true);
        setSelectedBundle(null);
        setCustomerPhone('');
      }
    } catch (error) {
      console.error('Payment window closed or execution failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050A14] text-white flex flex-col pb-12">
      {/* Dynamic Store Branding Header */}
      <header className="border-b border-white/10 p-6 flex items-center justify-between bg-[#0A1220]">
        <div className="flex items-center gap-4">
          {store.logo ? (
            <img src={store.logo} alt={store.name} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-black" style={{ backgroundColor: store.accentColor }}>
              {store.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold">{store.name}</h1>
            <p className="text-xs text-gray-400">{store.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <ShoppingBag size={16} /> Secure Checkout
        </div>
      </header>

      {/* Main Grid Frame */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Bundles Catalog */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold tracking-wide text-gray-300">Available Packages</h2>
          {paymentSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex gap-3 text-emerald-400 items-start">
              <CheckCircle className="shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold">Order Processed Successfully!</h4>
                <p className="text-sm opacity-90">Your bundle has been requested and is compiling for remote network delivery.</p>
              </div>
            </div>
          )}
          <div className="grid gap-3">
            {bundles.map((bundle) => (
              <div 
                key={bundle.id} 
                onClick={() => { setSelectedBundle(bundle); setPaymentSuccess(false); }}
                className={`p-5 border rounded-xl flex justify-between items-center cursor-pointer transition-all bg-[#0A1220] ${
                  selectedBundle?.id === bundle.id ? 'border-2' : 'border-white/5 hover:border-white/20'
                }`}
                style={{ borderColor: selectedBundle?.id === bundle.id ? store.accentColor : undefined }}
              >
                <div>
                  <h3 className="font-bold text-lg">{bundle.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400">{bundle.network || 'MTN'}</span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black" style={{ color: store.accentColor }}>{bundle.price} GHS</div>
                  <div className="text-sm text-gray-400">{bundle.size}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guest Order Summary Panel */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-wide text-gray-300">Checkout</h2>
          <div className="bg-[#0A1220] border border-white/5 rounded-2xl p-6 sticky top-8">
            {selectedBundle ? (
              <form onSubmit={handleCheckout} className="space-y-5">
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Selected Plan</span>
                  <div className="text-xl font-bold">{selectedBundle.name}</div>
                  <div className="text-lg font-extrabold mt-1" style={{ color: store.accentColor }}>{selectedBundle.price} GHS</div>
                </div>

                <hr className="border-white/10" />

                <div className="space-y-2">
                  <label className="text-xs text-gray-400 uppercase tracking-widest block">Recipient Phone Number</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-3.5 text-gray-500 w-5 h-5" />
                    <input 
                      type="tel" 
                      placeholder="e.g. 054XXXXXXX" 
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pl-11 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500">Ensure this match the transaction operator delivery system destination network link.</p>
                </div>

                <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="w-full py-4 rounded-xl text-black font-black flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50"
                  style={{ backgroundColor: store.accentColor }}
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    `Pay ${selectedBundle.price} GHS via Paystack`
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ShoppingBag className="mx-auto w-10 h-10 mb-3 opacity-30" />
                Select a package from the inventory panel to run transactional guest payment processing securely.
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
