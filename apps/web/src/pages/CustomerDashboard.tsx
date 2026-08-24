import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

export default function CustomerDashboard() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedBiz, setSelectedBiz] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [paymentPhone, setPaymentPhone] = useState('');

  const loadData = async () => {
    try {
      const biz = await apiFetch('/api/v1/businesses');
      setBusinesses(biz);
      const userOrders = await apiFetch('/api/v1/orders');
      setOrders(userOrders);
      const userCart = await apiFetch('/api/v1/cart');
      setCart(userCart);
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectBusiness = async (biz: any) => {
    setSelectedBiz(biz);
    try {
      const items = await apiFetch(`/api/v1/businesses/${biz.id}/products`);
      setProducts(items);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const addToCart = async (product: any) => {
    try {
      await apiFetch('/api/v1/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const checkout = async () => {
    if (!selectedBiz) return;
    try {
      let addressId = '';
      const addresses = await apiFetch('/api/v1/users/me/addresses');
      if (addresses.length === 0) {
        const newAddress = await apiFetch('/api/v1/users/me/addresses', {
          method: 'POST',
          body: JSON.stringify({
            label: 'Home',
            addressLine: 'Juja Main St, Block B',
            area: 'Juja',
            latitude: -1.1026,
            longitude: 37.0132,
            isDefault: true,
          }),
        });
        addressId = newAddress.id;
      } else {
        addressId = addresses[0].id;
      }

      const order = await apiFetch('/api/v1/orders', {
        method: 'POST',
        body: JSON.stringify({
          businessId: selectedBiz.id,
          deliveryAddressId: addressId,
          customerNotes: 'Deliver near Juja stage',
        }),
      });

      const checkoutPhone = paymentPhone || '+254712345678';
      await apiFetch('/api/v1/payments/stkpush', {
        method: 'POST',
        body: JSON.stringify({
          orderId: order.id,
          phone: checkoutPhone,
        }),
      });

      setSelectedBiz(null);
      setProducts([]);
      loadData();
      alert('Order Placed! Check status below.');
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Customer Dashboard</h2>
      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="grid md:grid-cols-3 gap-8">
        {/* Step 1: Browse Stores */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2">1. Choose a Store</h3>
          <div className="space-y-3">
            {businesses.map((biz) => (
              <div
                key={biz.id}
                onClick={() => selectBusiness(biz)}
                className={`p-4 rounded-lg border cursor-pointer transition ${
                  selectedBiz?.id === biz.id
                    ? 'border-brand-600 bg-brand-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <h4 className="font-bold text-gray-900">{biz.businessName}</h4>
                <p className="text-xs text-gray-500">{biz.area} â€¢ Radius: 15km</p>
              </div>
            ))}
            {businesses.length === 0 && <p className="text-sm text-gray-500">No active stores registered yet.</p>}
          </div>
        </div>

        {/* Step 2: Browse Products */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2">2. Products</h3>
          {selectedBiz ? (
            <div className="space-y-3">
              {products.map((p) => (
                <div key={p.id} className="p-4 rounded-lg border border-gray-200 flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-900">{p.name}</h4>
                    <p className="text-sm text-brand-600 font-bold">KSh {Number(p.price).toFixed(0)}</p>
                  </div>
                  <button
                    onClick={() => addToCart(p)}
                    className="bg-brand-600 hover:bg-brand-700 text-white text-xs px-3 py-1.5 rounded font-bold"
                  >
                    Add
                  </button>
                </div>
              ))}
              {products.length === 0 && <p className="text-sm text-gray-500">No products found in this store.</p>}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Select a store to view products.</p>
          )}
        </div>

        {/* Step 3: Checkout */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2">3. Shopping Cart</h3>
          {cart.length > 0 ? (
            <div className="space-y-4">
              {cart.map((cartItem) => (
                <div key={cartItem.id} className="bg-gray-50 p-4 rounded-lg space-y-2 border">
                  <h4 className="font-bold text-sm text-gray-700">{cartItem.business.businessName}</h4>
                  {cartItem.items.map((item: any) => (
                    <div key={item.id} className="text-sm flex justify-between text-gray-600">
                      <span>{item.product.name} x {item.quantity}</span>
                      <span>KSh {Number(item.unitPrice * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t flex justify-between font-bold text-sm">
                    <span>Total Amount</span>
                    <span>KSh {cartItem.items.reduce((acc: number, i: any) => acc + Number(i.unitPrice * i.quantity), 0)}</span>
                  </div>
                </div>
              ))}

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-600">M-Pesa Number for Checkout</label>
                <input
                  type="text"
                  placeholder="+254712345678"
                  value={paymentPhone}
                  onChange={(e) => setPaymentPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>

              <button
                onClick={checkout}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm py-2.5 rounded-lg font-bold"
              >
                Place Order &amp; Pay
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Cart is empty.</p>
          )}
        </div>
      </div>

      {/* Orders Tracking */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Your Orders &amp; Delivery Tracking</h3>
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="p-4 border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm font-bold text-gray-700">{o.orderNumber}</span>
                  <span className="text-xs text-gray-500">â€¢ {o.business.businessName}</span>
                </div>
                <p className="text-xs text-gray-600">Total Paid: KSh {Number(o.totalAmount).toFixed(0)}</p>
              </div>

              <div className="flex space-x-3 text-xs">
                <span className="bg-blue-100 text-blue-800 font-semibold px-2.5 py-1 rounded-full">
                  Payment: {o.paymentStatus}
                </span>
                <span className="bg-amber-100 text-amber-800 font-semibold px-2.5 py-1 rounded-full animate-pulse">
                  Status: {o.orderStatus}
                </span>
              </div>
            </div>
          ))}
          {orders.length === 0 && <p className="text-sm text-gray-500">You haven't placed any orders yet.</p>}
        </div>
      </div>
    </div>
  );
}