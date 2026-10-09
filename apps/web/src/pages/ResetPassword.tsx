import { FormEvent, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../utils/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(token ? '' : 'This password reset link is missing its token.');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiFetch('/api/v1/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      setMessage(response.message);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not reset your password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold text-gray-900">Set a new password</h2>
        <p className="text-sm text-gray-500">Choose a new password for your SOKOZA account.</p>
      </div>

      {message && <div role="status" className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">{message}</div>}
      {error && <div role="alert" className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-100">{error}</div>}

      {!message && (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">New password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="mt-1 w-full px-3.5 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-brand-500 focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm new password</label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              className="mt-1 w-full px-3.5 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-brand-500 focus:border-brand-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !token}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg font-semibold shadow transition disabled:opacity-50"
          >
            {submitting ? 'Updating...' : 'Reset password'}
          </button>
        </form>
      )}

      <div className="text-center text-sm text-gray-600">
        <Link to="/login" className="text-brand-600 hover:underline font-medium">Return to sign in</Link>
      </div>
    </div>
  );
}
