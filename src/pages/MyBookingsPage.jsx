import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingsAPI } from '../services/api';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await bookingsAPI.getMyBookings();
        setBookings(Array.isArray(data) ? data : data.bookings || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">You haven&apos;t booked any events yet.</p>
          <Link
            to="/"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking._id || booking.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {booking.eventName || booking.event?.name || 'Event'}
                </p>
                <p className="text-sm text-gray-500">
                  Qty: {booking.quantity} · Total: ${(booking.totalPrice || 0).toFixed(2)}
                </p>
                <p className="text-xs text-gray-400 font-mono mt-1">
                  {booking._id || booking.id}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  booking.status === 'confirmed'
                    ? 'bg-green-100 text-green-700'
                    : booking.status === 'cancelled'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {booking.status || 'pending'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
