import { useLocation, useNavigate, Link } from 'react-router-dom';

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;

  if (!booking) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No payment information found.</p>
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

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-500 mb-6">
          Your tickets have been confirmed. A confirmation email will be sent shortly.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-gray-600">Booking ID</p>
          <p className="font-mono text-sm text-gray-800 mb-2">{booking._id || booking.id}</p>
          {booking.totalPrice != null && (
            <>
              <p className="text-sm text-gray-600">Amount Paid</p>
              <p className="text-lg font-bold text-indigo-600">
                ${(booking.totalPrice || booking.amount || 0).toFixed(2)}
              </p>
            </>
          )}
        </div>

        <div className="flex gap-3">
          <Link
            to="/my-bookings"
            className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            My Bookings
          </Link>
          <Link
            to="/"
            className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Browse Events
          </Link>
        </div>
      </div>
    </div>
  );
}
