import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

export default function BusinessDashboard() {

  const [activeBiz, setActiveBiz] = useState<any>(null);
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pSku, setPSku] = useState('');
  const [pQty, setPQty] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const bizList = await apiFetch('/api/v1/businesses');
      if (bizList.length > 0) {
        setActiveBiz(bizList[0]);
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createBusiness = async () => {
    try {
      await apiFetch('/api/v1/businesses', {
        method: 'POST',
        body: JSON.stringify({
          businessName: 'My Juja Store',
          description: 'Local Kenyan goods and groceries',
          phone: '+254712345678',
          email: 'store@juja.co.ke',
          address: 'Juja Junction Block 4',
          area: 'Juja',
          latitude: -1.1026,
          longitude: 37.0132,
        }),
      });
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBiz) return;
    try {
      let categoryId = '';
      const categories = await apiFetch('/api/v1/categories');
      if (categories.length === 0) {
        const cat = await apiFetch('/api/v1/categories', {
          method: 'POST',
          body: JSON.stringify({
            name: 'Groceries',
            description: 'Fresh groceries and grains',
          }),
        });
        categoryId = cat.id;
      } else {
        categoryId = categories[0].id;
      }

      await apiFetch('/api/v1/products', {
        method: 'POST',
        body: JSON.stringify({
          businessId: activeBiz.id,
          categoryId,
          name: pName,
          description: 'Local Kenya product',
          price: Number(pPrice),
          sku: pSku || `SKU-${Date.now()}`,
          quantity: Number(pQty) || 10,
        }),
      });

      setPName('');
      setPPrice('');
      setPSku('');
      setPQty('');
      alert('Product Added!');
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Merchant Dashboard</h2>
        {!activeBiz && (
          <button
            onClick={createBusiness}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-lg font-bold"
          >
            Register Storefront
          </button>
        )}
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      {activeBiz ? (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Add Product Form */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-800">Add Product to {activeBiz.businessName}</h3>
            <form onSubmit={addProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unga wa Ngano 2kg"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600">Price (KSh)</label>
                  <input
                    type="number"
                    required
                    placeholder="180"
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600">Initial Stock</label>
                  <input
                    type="number"
                    required
                    placeholder="50"
                    value={pQty}
                    onChange={(e) => setPQty(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600">SKU Reference</label>
                <input
                  type="text"
                  placeholder="e.g. UNG-NG-001"
                  value={pSku}
                  onChange={(e) => setPSku(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-bold text-sm"
              >
                Add Product
              </button>
            </form>
          </div>

          {/* Orders Tracking */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Incoming Customer Orders</h3>
            <p className="text-xs text-gray-500">Orders placed by customers to your storefront will arrive here.</p>
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-dashed text-center">
              <span className="text-sm font-medium text-gray-600 block">Orders Monitor</span>
              <span className="text-xs text-gray-400">Order verification is running in the background. Use the customer app side to checkout products to test notifications here.</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center space-y-4">
          <p className="text-gray-600">You do not have a business registered yet.</p>
          <button
            onClick={createBusiness}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-bold transition"
          >
            Create My Juja Business
          </button>
        </div>
      )}
    </div>
  );
}