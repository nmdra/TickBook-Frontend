import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
<<<<<<< HEAD
import { Ticket, CalendarDays, LogOut, User, Menu, X, ListMusic } from 'lucide-react';
=======
import { Ticket, CalendarDays, LogOut, User, Menu, X, LayoutDashboard } from 'lucide-react';
>>>>>>> 2b6d5868d594ba059c055cbbec38bb413cc16678
import { useState } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground hover:opacity-80 transition-opacity">
            <Ticket className="size-5 text-primary" />
            TickBook
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
              <Button variant="ghost" size="sm" asChild>
               <Link to="/events">
                 <CalendarDays className="size-4" />
                 All Events
               </Link>
             </Button>

              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/admin">
                        <LayoutDashboard className="size-4" />
                        Admin Dashboard
                      </Link>
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/my-bookings">
                      <Ticket className="size-4" />
                    My Bookings
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/my-events">
                    <ListMusic className="size-4" />
                    My Events
                  </Link>
                </Button>
                <div className="h-5 w-px bg-border mx-2" />
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <User className="size-3.5" />
                  {user?.name || user?.email}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="size-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Register</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t pb-4 pt-2 space-y-1">
            <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
              <Link to="/events" onClick={() => setMobileOpen(false)}>
                <CalendarDays className="size-4" />
                All Events
              </Link>
            </Button>

            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                    <Link to="/admin" onClick={() => setMobileOpen(false)}>
                      <LayoutDashboard className="size-4" />
                      Admin Dashboard
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                  <Link to="/my-bookings" onClick={() => setMobileOpen(false)}>
                    <Ticket className="size-4" />
                    My Bookings
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                  <Link to="/my-events" onClick={() => setMobileOpen(false)}>
                    <ListMusic className="size-4" />
                    My Events
                  </Link>
                </Button>
                <div className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-1.5">
                  <User className="size-3.5" />
                  {user?.name || user?.email}
                </div>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleLogout}>
                  <LogOut className="size-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>Login</Link>
                </Button>
                <Button size="sm" className="w-full justify-start" asChild>
                  <Link to="/register" onClick={() => setMobileOpen(false)}>Register</Link>
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
