import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { bookingsAPI, eventsAPI } from '@/services/api';
import { formatEventDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CalendarDays, DollarSign, ShieldCheck, Ticket, Users } from 'lucide-react';

const statusVariant = {
  confirmed: 'default',
  cancelled: 'destructive',
  pending: 'secondary',
};

const formatCurrency = (value) => {
  const amount = Number(value) || 0;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export default function AdminDashboardPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      return undefined;
    }

    let isActive = true;
    const fetchAdminData = async () => {
      setLoading(true);
      setError('');
      try {
        const [eventsResponse, bookingsResponse] = await Promise.all([
          eventsAPI.getAll(),
          bookingsAPI.getAll(),
        ]);
        if (!isActive) return;
        const eventData = Array.isArray(eventsResponse.data)
          ? eventsResponse.data
          : eventsResponse.data?.events || [];
        const bookingData = Array.isArray(bookingsResponse.data)
          ? bookingsResponse.data
          : bookingsResponse.data?.bookings || [];
        setEvents(eventData);
        setBookings(bookingData);
      } catch (err) {
        if (!isActive) return;
        setError(err.response?.data?.error || err.response?.data?.message || 'Failed to load admin data');
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchAdminData();

    return () => {
      isActive = false;
    };
  }, [isAdmin]);

  const summary = useMemo(() => {
    const totalEvents = events.length;
    const totalBookings = bookings.length;
    const totalTicketsSold = bookings.reduce((acc, booking) => acc + (Number(booking.tickets) || 0), 0);
    const totalRevenue = bookings.reduce((acc, booking) => acc + (parseFloat(booking.total_amount) || 0), 0);
    const uniqueUsers = new Set(
      bookings.map((booking) => booking.user_id).filter((userId) => userId !== null && userId !== undefined)
    ).size;

    return { totalEvents, totalBookings, totalTicketsSold, totalRevenue, uniqueUsers };
  }, [bookings, events]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <ShieldCheck className="size-12 mx-auto text-primary" />
            <div>
              <h2 className="text-2xl font-bold">Admin access required</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Please log in with an admin account to access the dashboard.
              </p>
            </div>
            <Button asChild>
              <Link to="/login">Go to login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <ShieldCheck className="size-12 mx-auto text-primary" />
            <div>
              <h2 className="text-2xl font-bold">Admin only</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Your account doesn&apos;t have permission to view this dashboard.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/">Back to events</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor platform activity, bookings, and upcoming events.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/">
            <CalendarDays className="size-4" />
            View public events
          </Link>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="size-4" />
                Total events
              </div>
              <p className="text-2xl font-bold">{summary.totalEvents}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Ticket className="size-4" />
                Total bookings
              </div>
              <p className="text-2xl font-bold">{summary.totalBookings}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="size-4" />
                Unique users
              </div>
              <p className="text-2xl font-bold">{summary.uniqueUsers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="size-4" />
                Revenue
              </div>
              <p className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Upcoming events</h2>
                <p className="text-xs text-muted-foreground">Showing latest events in the system.</p>
              </div>
              <Badge variant="secondary">{events.length}</Badge>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : events.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events available yet.</p>
            ) : (
              <div className="space-y-3">
                {events.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-start justify-between gap-4 rounded-xl border p-4">
                    <div className="space-y-1">
                      <p className="font-medium">{event.title || `Event #${event.id}`}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatEventDate(event.date)} · {event.venue || 'Venue TBD'}
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p className="font-medium text-foreground">
                        {formatCurrency(event.price)}
                      </p>
                      <p>
                        {event.available_tickets ?? '—'} / {event.total_tickets ?? '—'} tickets
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Recent bookings</h2>
                <p className="text-xs text-muted-foreground">Newest bookings across all users.</p>
              </div>
              <Badge variant="secondary">{bookings.length}</Badge>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bookings yet.</p>
            ) : (
              <div className="space-y-3">
                {bookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-start justify-between gap-4 rounded-xl border p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={statusVariant[booking.status] || 'secondary'}>
                          {booking.status || 'pending'}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono">#{booking.id}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Event #{booking.event_id} · User #{booking.user_id ?? '—'}
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p className="font-medium text-foreground">
                        {formatCurrency(booking.total_amount)}
                      </p>
                      <p>{booking.tickets || 0} tickets</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
