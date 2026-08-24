import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await apiFetch('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      await login(res.accessToken);

      // Redirect based on role
      const roles = res.user?.roles || [];
      if (roles.includes('RIDER')) {
        navigate('/rider/dashboard');
      } else if (roles.includes('BUSINESS_OWNER')) {
        navigate('/business/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold text-gray-900">Welcome Back</h2>
        <p className="text-sm text-gray-500">Sign in to your SOKOZA account</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-100">
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="name@example.com"
            className="mt-1 w-full px-3.5 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-brand-500 focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
            className="mt-1 w-full px-3.5 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-brand-500 focus:border-brand-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg font-semibold shadow transition disabled:opacity-50"
        >
          {submitting ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link to="/register" className="text-brand-600 hover:underline font-medium">
          Register
        </Link>
      </div>
    </div>
  );
}