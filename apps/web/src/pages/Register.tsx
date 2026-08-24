import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<'CUSTOMER' | 'BUSINESS_OWNER' | 'RIDER'>('CUSTOMER');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await apiFetch('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          password,
          role,
        }),
      });

      await login(res.accessToken);

      if (role === 'RIDER') {
        navigate('/rider/dashboard');
      } else if (role === 'BUSINESS_OWNER') {
        navigate('/business/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold text-gray-900">Create Account</h2>
        <p className="text-sm text-gray-500">Join the Sokoza local marketplace</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-100">
          {error}
        </div>
      )}

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1.5 rounded-lg text-xs font-semibold">
        {(['CUSTOMER', 'BUSINESS_OWNER', 'RIDER'] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`py-1.5 rounded-md transition ${
              role === r
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {r === 'CUSTOMER' ? 'Customer' : r === 'BUSINESS_OWNER' ? 'Business' : 'Rider'}
          </button>
        ))}
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-brand-500 focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-brand-500 focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="john@example.com"
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-brand-500 focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="+254712345678"
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-brand-500 focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Min. 8 characters"
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-brand-500 focus:border-brand-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg font-semibold shadow transition disabled:opacity-50"
        >
          {submitting ? 'Registering...' : `Register as ${role === 'CUSTOMER' ? 'Customer' : role === 'BUSINESS_OWNER' ? 'Business Owner' : 'Rider'}`}
        </button>
      </form>

      <div className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-600 hover:underline font-medium">
          Sign In
        </Link>
      </div>
    </div>
  );
}