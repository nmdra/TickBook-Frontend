import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { paymentsAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export default function CheckoutFlow() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const booking = location.state?.booking;

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!booking) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No booking found. Please select an event first.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  const amount = parseFloat(booking.total_amount) || 0;

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await paymentsAPI.create({
        bookingId: booking.id,
        userId: user?.id,
        amount,
        status: 'pending',
        paymentMethod: 'credit_card',
      });
      navigate('/payment-success', { state: { booking } });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h2>

        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">Booking ID</p>
          <p className="font-mono text-sm text-gray-800">{booking.id}</p>
          <p className="text-sm text-gray-600 mt-2">Tickets</p>
          <p className="text-sm text-gray-800">{booking.tickets}</p>
          <p className="text-sm text-gray-600 mt-2">Total</p>
          <p className="text-xl font-bold text-indigo-600">
            ${amount.toFixed(2)}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <label htmlFor="card" className="block text-sm font-medium text-gray-700 mb-1">
              Card number
            </label>
            <input
              id="card"
              type="text"
              required
              maxLength={19}
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="4242 4242 4242 4242"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
                Expiry
              </label>
              <input
                id="expiry"
                type="text"
                required
                maxLength={5}
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="MM/YY"
              />
            </div>
            <div>
              <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                CVV
              </label>
              <input
                id="cvv"
                type="text"
                required
                maxLength={4}
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="123"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors mt-2"
          >
            {loading ? 'Processing…' : 'Pay Now'}
          </button>
        </form>
      </div>
    </div>
  );
}
