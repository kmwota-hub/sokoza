import { Link, Outlet } from 'react-router-dom';
import { ShoppingBag, MapPin } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      {/* Header Banner */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 hover:opacity-90">
            <div className="bg-brand-600 text-white p-2 rounded-lg font-bold flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-gray-900">SOKOZA</span>
              <span className="hidden sm:inline-block text-xs ml-2 text-brand-700 font-medium bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100">
                Juja, Kenya
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-4 text-sm">
            <span className="flex items-center text-gray-600 font-medium">
              <MapPin className="w-4 h-4 text-brand-600 mr-1" /> Juja Town
            </span>
            <span className="h-4 w-px bg-gray-200"></span>
            <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">
              Login
            </Link>
            <Link to="/register" className="bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded-lg font-medium transition">
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-12 flex-1 w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} SOKOZA. Shop Local. Get It Delivered. Built for Juja &amp; Kenya.
      </footer>
    </div>
  );
}