import { useEffect, useState } from 'react';
import { ShoppingBag, Truck, Store, CheckCircle2, ShieldCheck } from 'lucide-react';
import { APP_CONFIG } from '@sokoza/config';
import { Link } from 'react-router-dom';

export default function Landing() {
  const [apiHealth, setApiHealth] = useState<{ status: string; service: string; location: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/health')
      .then((res) => res.json())
      .then((data) => {
        setApiHealth(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
          Shop Local. <span className="text-brand-600">Get It Delivered.</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Connecting customers, local businesses, and verified riders across Juja and surrounding areas.
        </p>
        <div className="pt-4 flex justify-center space-x-4">
          <Link to="/register" className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-lg font-semibold shadow transition">
            Get Started
          </Link>
          <Link to="/login" className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-semibold transition">
            Sign In
          </Link>
        </div>
      </div>

      {/* System Ecosystem Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 bg-brand-50 rounded-lg flex items-center justify-center mb-4 text-brand-600">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-1">Customers</h3>
          <p className="text-sm text-gray-600 mb-4">
            Discover local Juja storefronts, order products, track live delivery, and rate experiences.
          </p>
          <Link to="/dashboard" className="text-brand-600 hover:text-brand-700 font-semibold text-sm">
            Go to Customer App &rarr;
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-4 text-emerald-600">
            <Store className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-1">Businesses</h3>
          <p className="text-sm text-gray-600 mb-4">
            Manage inventory, receive orders, and deliver via own riders or request Sokoza platform riders.
          </p>
          <Link to="/business/dashboard" className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm">
            Go to Store Manager &rarr;
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center mb-4 text-amber-600">
            <Truck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-1">Riders</h3>
          <p className="text-sm text-gray-600 mb-4">
            Get verified, toggle availability, receive dispatch opportunities, and earn transparent income.
          </p>
          <Link to="/rider/dashboard" className="text-amber-600 hover:text-amber-700 font-semibold text-sm">
            Go to Rider Portal &rarr;
          </Link>
        </div>
      </div>

      {/* Phase 1 Verification Status Banner */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <ShieldCheck className="w-6 h-6 text-brand-600" />
          <h2 className="text-xl font-bold text-gray-900">Phase 1 & 2 Monorepo Architecture Active</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex justify-between items-center">
            <span className="font-medium text-gray-700">API Health Status:</span>
            {loading ? (
              <span className="text-gray-400">Connecting...</span>
            ) : apiHealth ? (
              <span className="inline-flex items-center text-brand-700 font-semibold bg-brand-100 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> UP ({apiHealth.service})
              </span>
            ) : (
              <span className="text-amber-700 font-semibold bg-amber-100 px-2 py-0.5 rounded-full">
                Offline / Standalone Mode
              </span>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex justify-between items-center">
            <span className="font-medium text-gray-700">Primary Market:</span>
            <span className="font-semibold text-gray-900">{APP_CONFIG.initialLocation.name}, Kenya</span>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex justify-between items-center">
            <span className="font-medium text-gray-700">Currency Default:</span>
            <span className="font-semibold text-gray-900">{APP_CONFIG.currency}</span>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex justify-between items-center">
            <span className="font-medium text-gray-700">Architecture:</span>
            <span className="font-semibold text-gray-900">Modular Monolith</span>
          </div>
        </div>
      </div>
    </div>
  );
}