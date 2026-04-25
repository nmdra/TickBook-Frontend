import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  CalendarDays,
  LayoutDashboard,
  ListMusic,
  LogOut,
  Menu,
  Plus,
  Ticket,
  User,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/events', label: 'Browse Events', icon: CalendarDays },
  { to: '/my-bookings', label: 'My Bookings', icon: Ticket, authOnly: true },
  { to: '/my-events', label: 'My Events', icon: ListMusic, authOnly: true },
  { to: '/admin', label: 'Admin', icon: LayoutDashboard, adminOnly: true },
];

function NavLinkButton({ item, onClick }) {
  const location = useLocation();
  const Icon = item.icon;
  const isActive = location.pathname === item.to;

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        'gap-2 rounded-full px-3 text-sm text-muted-foreground transition-colors hover:text-foreground',
        isActive && 'bg-primary/10 text-primary hover:text-primary',
      )}
      asChild
    >
      <Link to={item.to} onClick={onClick}>
        <Icon className="size-4" />
        {item.label}
      </Link>
    </Button>
  );
}

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleNavItems = navItems.filter((item) => {
    if (item.adminOnly) return isAdmin;
    if (item.authOnly) return isAuthenticated;
    return true;
  });

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/88 backdrop-blur-xl supports-[backdrop-filter]:bg-background/78">
      <div className="page-shell">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-full text-lg font-bold tracking-tight text-foreground transition-opacity hover:opacity-80"
          >
            <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <Ticket className="size-4" />
            </span>
            TickBook
          </Link>

          <div className="hidden flex-1 items-center gap-1 md:flex">
            <div className="ml-4 flex items-center gap-1">
              {visibleNavItems.map((item) => (
                <NavLinkButton key={item.to} item={item} />
              ))}
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {isAuthenticated ? (
              <>
                <Button size="sm" className="rounded-full gap-2" asChild>
                  <Link to="/add-event">
                    <Plus className="size-4" />
                    Create Event
                  </Link>
                </Button>
                <Link
                  to="/profile"
                  className="flex max-w-[12rem] items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <User className="size-3.5 shrink-0" />
                  <span className="truncate">{user?.name || user?.email}</span>
                </Link>
                <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={handleLogout}>
                  <LogOut className="size-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="rounded-full" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button size="sm" className="rounded-full" asChild>
                  <Link to="/register">Register</Link>
                </Button>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>

        {mobileOpen && (
          <div className="border-t py-3 md:hidden">
            <div className="grid gap-1">
              {visibleNavItems.map((item) => (
                <NavLinkButton key={item.to} item={item} onClick={() => setMobileOpen(false)} />
              ))}
              {isAuthenticated ? (
                <>
                  <Button size="sm" className="mt-2 w-full justify-start rounded-full gap-2" asChild>
                    <Link to="/add-event" onClick={() => setMobileOpen(false)}>
                      <Plus className="size-4" />
                      Create Event
                    </Link>
                  </Button>
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Signed in as {user?.name || user?.email}
                  </div>
                  <Button variant="outline" size="sm" className="w-full justify-start rounded-full gap-2" onClick={handleLogout}>
                    <LogOut className="size-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="rounded-full" asChild>
                    <Link to="/login" onClick={() => setMobileOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button size="sm" className="rounded-full" asChild>
                    <Link to="/register" onClick={() => setMobileOpen(false)}>
                      Register
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
