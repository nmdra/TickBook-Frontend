import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { bookingsAPI } from '../../services/api';

export default function BookingModal({ event, onClose }) {
  const [tickets, setTickets] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  if (!event) return null;

  const price = parseFloat(event.price) || 0;
  const totalPrice = price * tickets;
  const isSoldOut = event.available_tickets != null && event.available_tickets <= 0;
  const maxTickets = isSoldOut ? 0 : Math.min(10, event.available_tickets ?? 10);

  const handleBook = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await bookingsAPI.create({
        user_id: user.id,
        event_id: event.id,
        tickets,
      });
      onClose();
      navigate('/checkout', { state: { booking: data, event } });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Book Tickets</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            &times;
          </button>
        </div>

        <div className="border-b border-gray-200 pb-4 mb-4">
          <p className="font-medium text-gray-800">{event.title}</p>
          <p className="text-sm text-gray-500 mt-1">
            {event.date ? new Date(event.date).toLocaleDateString() : 'TBA'} · {event.venue || 'Online'}
          </p>
          <p className="text-indigo-600 font-semibold mt-1">${price.toFixed(2)} per ticket</p>
          {event.available_tickets != null && (
            <p className="text-xs text-gray-400 mt-1">
              {event.available_tickets}{event.total_tickets != null ? ` / ${event.total_tickets}` : ''} tickets available
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {!isSoldOut && (
          <div className="mb-6">
            <label htmlFor="tickets" className="block text-sm font-medium text-gray-700 mb-1">
              Number of tickets
            </label>
            <input
              id="tickets"
              type="number"
              min="1"
              max={maxTickets}
              value={tickets}
              onChange={(e) => setTickets(Math.max(1, Math.min(maxTickets, Number(e.target.value))))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        {isSoldOut ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm text-center">
            This event is sold out.
          </div>
        ) : (
          <div className="flex items-center justify-between mb-6">
            <span className="text-gray-600">Total</span>
            <span className="text-2xl font-bold text-gray-900">${totalPrice.toFixed(2)}</span>
          </div>
        )}

        <button
          onClick={handleBook}
          disabled={loading || isSoldOut}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Booking…' : isAuthenticated ? 'Proceed to Checkout' : 'Login to Book'}
        </button>
      </div>
    </div>
  );
}
