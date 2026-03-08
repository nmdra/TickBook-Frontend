import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-indigo-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold tracking-tight">
            🎟️ TickBook
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-indigo-200 transition-colors">
              Events
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/my-bookings" className="hover:text-indigo-200 transition-colors">
                  My Bookings
                </Link>
                <span className="text-indigo-200 text-sm">
                  {user?.name || user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-md text-sm transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hover:text-indigo-200 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-indigo-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-indigo-50 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
