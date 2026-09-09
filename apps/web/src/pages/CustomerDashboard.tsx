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
  const [pollingOrderId, setPollingOrderId] = useState<string | null>(null);
  const [paymentStatusMsg, setPaymentStatusMsg] = useState('');
  const [reviewingOrder, setReviewingOrder] = useState<any>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');

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
    
    // Simulate FCM device token registration on mount
    const registerFcmToken = async () => {
      try {
        const token = localStorage.getItem('fcm_token') || `mock-fcm-token-${Math.random().toString(36).substring(7)}`;
        localStorage.setItem('fcm_token', token);
        await apiFetch('/api/v1/notifications/token', {
          method: 'POST',
          body: JSON.stringify({
            token,
            platform: 'web',
          }),
        });
        console.log('Mock FCM push token registered successfully:', token);
      } catch (e: any) {
        console.warn('Failed to register mock FCM token:', e.message);
      }
    };
    registerFcmToken();
  }, []);

  useEffect(() => {
    if (!pollingOrderId) return;

    let attempts = 0;
    const maxAttempts = 15; // 45 seconds total

    const checkStatus = async () => {
      try {
        const payment = await apiFetch(`/api/v1/payments/${pollingOrderId}/status`);
        if (payment.status === 'SUCCESS') {
          setPollingOrderId(null);
          setPaymentStatusMsg('');
          loadData();
          alert('Payment Successful! Your order is now confirmed.');
        } else if (payment.status === 'FAILED') {
          setPollingOrderId(null);
          setPaymentStatusMsg('');
          loadData();
          alert('Payment Failed. Please try paying again.');
        } else {
          attempts++;
          if (attempts >= maxAttempts) {
            setPollingOrderId(null);
            setPaymentStatusMsg('');
            alert('Payment authorization is taking longer than expected. Please check back later.');
          }
        }
      } catch (e: any) {
        console.error('Polling error:', e.message);
      }
    };

    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [pollingOrderId]);

  const submitReview = async () => {
    if (!reviewingOrder) return;
    try {
      await apiFetch('/api/v1/reviews', {
        method: 'POST',
        body: JSON.stringify({
          orderId: reviewingOrder.id,
          businessId: reviewingOrder.businessId,
          rating,
          comment,
        }),
      });
      setReviewingOrder(null);
      setComment('');
      setRating(5);
      loadData();
      alert('Review submitted successfully!');
    } catch (e: any) {
      alert(e.message);
    }
  };

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
      
      // Start polling for payment success
      setPollingOrderId(order.id);
      setPaymentStatusMsg('M-Pesa payment prompt sent to your phone! Please enter your PIN to authorize payment.');
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Customer Dashboard</h2>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {paymentStatusMsg && (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 p-4 rounded-xl text-sm flex flex-col space-y-2 animate-pulse">
          <div className="flex items-center space-x-2 font-bold">
            <span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block animate-ping"></span>
            <span>M-Pesa Payment Status Polling</span>
          </div>
          <p>{paymentStatusMsg}</p>
        </div>
      )}

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
            <div key={o.id} className="p-4 border rounded-lg bg-gray-50 space-y-3">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-bold text-gray-700">{o.orderNumber}</span>
                    <span className="text-xs text-gray-500">• {o.business.businessName}</span>
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

              {/* Review Feature */}
              {o.orderStatus === 'DELIVERED' && (
                <div className="pt-3 border-t border-gray-200">
                  {o.reviews && o.reviews.length > 0 ? (
                    <div className="text-xs text-gray-600 space-y-1 bg-white p-3 rounded-lg border border-gray-150">
                      <p className="font-semibold text-gray-700 flex items-center">
                        <span className="text-yellow-500 mr-1">★</span> Your Rating: {o.reviews[0].rating}/5
                      </p>
                      {o.reviews[0].comment && <p className="italic">"{o.reviews[0].comment}"</p>}
                    </div>
                  ) : reviewingOrder?.id === o.id ? (
                    <div className="bg-white p-3 rounded-lg border space-y-3 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-700">Rating:</span>
                        <select
                          value={rating}
                          onChange={(e) => setRating(Number(e.target.value))}
                          className="border rounded px-2 py-1 text-xs font-semibold text-gray-700"
                        >
                          <option value="5">5 Stars (Excellent)</option>
                          <option value="4">4 Stars (Good)</option>
                          <option value="3">3 Stars (Average)</option>
                          <option value="2">2 Stars (Poor)</option>
                          <option value="1">1 Star (Very Bad)</option>
                        </select>
                      </div>
                      <div className="space-y-1 flex flex-col">
                        <span className="font-semibold text-gray-700">Comments:</span>
                        <textarea
                          placeholder="Tell us about the food, delivery, or rider..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full border rounded p-2 text-xs focus:outline-none"
                          rows={2}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={submitReview}
                          className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-3 py-1.5 rounded"
                        >
                          Submit
                        </button>
                        <button
                          onClick={() => setReviewingOrder(null)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-3 py-1.5 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setReviewingOrder(o);
                        setRating(5);
                        setComment('');
                      }}
                      className="bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 text-xs px-3 py-1.5 rounded font-bold transition"
                    >
                      Rate &amp; Review Order
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          {orders.length === 0 && <p className="text-sm text-gray-500">You haven't placed any orders yet.</p>}
        </div>
      </div>
    </div>
  );
}