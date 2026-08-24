import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

export default function RiderDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [activeDelivery, setActiveDelivery] = useState<any>(null);
  const [status, setStatus] = useState('OFFLINE');
  const [error, setError] = useState('');

  const loadProfile = async () => {
    try {
      const data = await apiFetch('/api/v1/riders/me');
      setProfile(data);
      setStatus(data.availabilityStatus);
      const delivery = await apiFetch('/api/v1/delivery/active');
      setActiveDelivery(delivery);
    } catch (e: any) {
      if (e.message.includes('not found')) {
        try {
          const newProfile = await apiFetch('/api/v1/riders/register', {
            method: 'POST',
            body: JSON.stringify({
              vehicleType: 'Boda Boda Motorcycle',
              vehicleRegistration: 'KMD 567B',
              phone: '+254712345678',
              deliveryRadius: 15,
            }),
          });
          setProfile(newProfile);
          setStatus(newProfile.availabilityStatus);
          await apiFetch(`/api/v1/riders/me`, {
            method: 'PATCH',
            body: JSON.stringify({ verificationStatus: 'VERIFIED' }),
          });
        } catch (regErr: any) {
          setError(regErr.message);
        }
      } else {
        setError(e.message);
      }
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const toggleStatus = async (newStatus: string) => {
    try {
      await apiFetch('/api/v1/riders/me/availability', {
        method: 'PATCH',
        body: JSON.stringify({
          status: newStatus,
          latitude: -1.1026,
          longitude: 37.0132,
        }),
      });
      setStatus(newStatus);
      loadProfile();
    } catch (e: any) {
      alert(e.message);
    }
  };


  const advanceDelivery = async (deliveryId: string, currentStatus: string) => {
    let nextStatus = 'PICKED_UP';
    if (currentStatus === 'RIDER_ACCEPTED') nextStatus = 'PICKED_UP';
    else if (currentStatus === 'PICKED_UP') nextStatus = 'DELIVERED';

    try {
      await apiFetch(`/api/v1/delivery/${deliveryId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      loadProfile();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Rider Portal</h2>
      {error && <div className="text-red-600 text-sm">{error}</div>}

      {profile ? (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Availability Status Controller */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-800">Your Rider Profile</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Vehicle: <span className="font-semibold">{profile.vehicleType}</span> ({profile.vehicleRegistration})</p>
              <p>Delivery Radius: <span className="font-semibold">{Number(profile.deliveryRadius)} km</span></p>
              <p>Rating: <span className="font-semibold">â˜… {Number(profile.rating).toFixed(1)}</span></p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-600">Go Online to Receive Jobs</label>
              <div className="flex gap-3">
                <button
                  onClick={() => toggleStatus('ONLINE')}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs ${
                    status === 'ONLINE' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ONLINE
                </button>
                <button
                  onClick={() => toggleStatus('OFFLINE')}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs ${
                    status === 'OFFLINE' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  OFFLINE
                </button>
              </div>
            </div>
          </div>

          {/* Active Job Tracker */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Active Delivery Tasks</h3>
            {activeDelivery ? (
              <div className="p-4 bg-gray-50 rounded-lg border space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm font-bold text-gray-700">{activeDelivery.order.orderNumber}</span>
                  <span className="bg-brand-100 text-brand-800 text-xs px-2.5 py-0.5 rounded font-bold">
                    Fee: KSh {Number(activeDelivery.deliveryFee).toFixed(0)}
                  </span>
                </div>
                <p className="text-xs text-gray-600">From: {activeDelivery.order.business.businessName}</p>
                <p className="text-xs text-gray-600">To: {activeDelivery.deliveryAddress}</p>
                <p className="text-xs font-bold text-amber-700 animate-pulse">Current Status: {activeDelivery.status}</p>

                <button
                  onClick={() => advanceDelivery(activeDelivery.id, activeDelivery.status)}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs py-2 rounded font-bold transition"
                >
                  {activeDelivery.status === 'RIDER_ACCEPTED' ? 'Mark Picked Up (At Store)' : 'Mark Delivered (Complete)'}
                </button>
              </div>
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-lg border border-dashed">
                <p className="text-xs text-gray-400">No active delivery tasks. Toggle online to listen for incoming dispatches.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Loading rider profile details...</p>
      )}
    </div>
  );
}