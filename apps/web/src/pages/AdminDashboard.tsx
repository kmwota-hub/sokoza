import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

type Tab = 'stores' | 'users' | 'deliveries';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('stores');
  const [stores, setStores] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadStores = async () => {
    try {
      const data = await apiFetch('/api/v1/admin/stores');
      setStores(data);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await apiFetch('/api/v1/admin/users');
      setUsers(data);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const loadDeliveries = async () => {
    try {
      const data = await apiFetch('/api/v1/admin/deliveries');
      setDeliveries(data);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const loadDataForTab = async (tab: Tab) => {
    setLoading(true);
    setError('');
    if (tab === 'stores') await loadStores();
    else if (tab === 'users') await loadUsers();
    else if (tab === 'deliveries') await loadDeliveries();
    setLoading(false);
  };

  useEffect(() => {
    loadDataForTab(activeTab);
  }, [activeTab]);

  const updateStoreStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await apiFetch(`/api/v1/admin/stores/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      loadStores();
      alert(`Store status updated to ${nextStatus}`);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const promoteToAdmin = async (id: string) => {
    try {
      await apiFetch(`/api/v1/admin/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: 'ADMIN' }),
      });
      loadUsers();
      alert('User successfully promoted to ADMIN');
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Admin Control Panel</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('stores')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
              activeTab === 'stores' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Stores
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
              activeTab === 'users' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('deliveries')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
              activeTab === 'deliveries' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Deliveries
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      {loading ? (
        <div className="text-center py-12 text-sm text-gray-500">Loading admin data...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {activeTab === 'stores' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wider">
                  <th className="px-6 py-3">Store Name</th>
                  <th className="px-6 py-3">Area</th>
                  <th className="px-6 py-3">Owner</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                {stores.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold">{s.businessName}</td>
                    <td className="px-6 py-4">{s.area}</td>
                    <td className="px-6 py-4">
                      {s.owner.firstName} {s.owner.lastName}
                      <span className="block text-xs text-gray-500">{s.owner.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          s.businessStatus === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : s.businessStatus === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {s.businessStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => updateStoreStatus(s.id, s.businessStatus)}
                        className={`text-xs font-bold px-3 py-1.5 rounded transition ${
                          s.businessStatus === 'ACTIVE'
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {s.businessStatus === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
                {stores.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      No stores registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'users' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wider">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Roles</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                {users.map((u) => {
                  const roles = u.userRoles.map((ur: any) => ur.role.name);
                  const isAdmin = roles.includes('ADMIN');
                  return (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold">
                        {u.firstName} {u.lastName}
                      </td>
                      <td className="px-6 py-4">{u.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {roles.map((r: string) => (
                            <span
                              key={r}
                              className="px-2 py-0.5 bg-gray-100 border text-gray-600 rounded text-xs font-medium"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isAdmin && (
                          <button
                            onClick={() => promoteToAdmin(u.id)}
                            className="bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold px-3 py-1.5 rounded transition"
                          >
                            Make Admin
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'deliveries' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wider">
                  <th className="px-6 py-3">Order Number</th>
                  <th className="px-6 py-3">Pickup Address</th>
                  <th className="px-6 py-3">Delivery Address</th>
                  <th className="px-6 py-3">Delivery Fee</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                {deliveries.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono font-bold text-xs">{d.order.orderNumber}</td>
                    <td className="px-6 py-4 truncate max-w-xs">{d.pickupAddress}</td>
                    <td className="px-6 py-4 truncate max-w-xs">{d.deliveryAddress}</td>
                    <td className="px-6 py-4 font-semibold text-brand-600">KSh {Number(d.deliveryFee).toFixed(0)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          d.status === 'DELIVERED'
                            ? 'bg-green-100 text-green-800'
                            : d.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {deliveries.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      No deliveries dispatched yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
