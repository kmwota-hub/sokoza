import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const response = await apiFetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setMessage(response.message);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not request a reset link');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold text-gray-900">Forgot password?</h2>
        <p className="text-sm text-gray-500">Enter your account email and we’ll send a reset link.</p>
      </div>

      {message && <div role="status" className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">{message}</div>}
      {error && <div role="alert" className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-100">{error}</div>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="mt-1 w-full px-3.5 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-brand-500 focus:border-brand-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg font-semibold shadow transition disabled:opacity-50"
        >
          {submitting ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      <div className="text-center text-sm text-gray-600">
        Remembered your password? <Link to="/login" className="text-brand-600 hover:underline font-medium">Sign in</Link>
      </div>
    </div>
  );
}
