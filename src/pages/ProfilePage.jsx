import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { bookingsAPI, eventsAPI, paymentsAPI } from '../services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertCircle,
  CalendarDays,
  CreditCard,
  Mail,
  ShieldCheck,
  Ticket,
  User,
} from 'lucide-react';
import { formatEventDate } from '@/lib/utils';

const bookingStatusVariant = {
  confirmed: 'default',
  cancelled: 'destructive',
  pending: 'secondary',
};

const paymentStatusVariant = {
  completed: 'default',
  failed: 'destructive',
  pending: 'secondary',
  refunded: 'outline',
};

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10">
        <Icon className="size-4 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // 1. Get all bookings for this user
        const { data: bookingList } = await bookingsAPI.getByUser(user.id);
        const list = Array.isArray(bookingList) ? bookingList : [];

        // 2. Enrich with event details + payment info in parallel
        const enriched = await Promise.all(
          list.map(async (booking) => {
            const [eventResult, paymentResult] = await Promise.allSettled([
              eventsAPI.getById(booking.event_id),
              paymentsAPI.getByBookingId(booking.id),
            ]);

            const event =
              eventResult.status === 'fulfilled' ? eventResult.value.data : null;
            const payments =
              paymentResult.status === 'fulfilled'
                ? Array.isArray(paymentResult.value.data)
                  ? paymentResult.value.data
                  : []
                : [];

            // Use the latest payment record
            const payment = payments.length > 0 ? payments[payments.length - 1] : null;

            return { ...booking, event, payment };
          })
        );

        setBookings(enriched);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const totalSpent = bookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0);

  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <User className="size-12 mx-auto text-muted-foreground opacity-40" />
        <p className="text-lg font-medium">Not logged in</p>
        <Button asChild><Link to="/login">Sign In</Link></Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

      {/* ── Profile Card ── */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="grid size-16 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
              {(user.name || user.email || '?')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold truncate">{user.name || 'User'}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Mail className="size-3.5" />
                {user.email}
              </p>
              {(user.role || user.isAdmin) && (
                <Badge variant="secondary" className="mt-2 gap-1">
                  <ShieldCheck className="size-3" />
                  {user.isAdmin ? 'Admin' : user.role}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Ticket}      label="Total Bookings"    value={bookings.length} />
        <StatCard icon={CalendarDays} label="Confirmed"         value={confirmedCount} />
        <StatCard icon={AlertCircle}  label="Pending"           value={pendingCount} />
        <StatCard icon={CreditCard}   label="Total Spent"       value={`$${totalSpent.toFixed(2)}`} />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ── Bookings & Payments ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">My Tickets & Payments</h2>
          <Button variant="outline" size="sm" asChild>
            <Link to="/my-bookings">View All</Link>
          </Button>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center space-y-4">
              <Ticket className="size-12 mx-auto text-muted-foreground opacity-40" />
              <p className="text-lg font-medium">No bookings yet</p>
              <Button asChild><Link to="/events">Browse Events</Link></Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => {
              const eventTitle = booking.event?.title || `Event #${booking.event_id}`;
              const eventDate = booking.event?.date
                ? formatEventDate(booking.event.date)
                : '—';
              const payment = booking.payment;

              return (
                <Card key={booking.id} className="py-0">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                      {/* Left: booking info */}
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={bookingStatusVariant[booking.status] || 'secondary'}>
                            {booking.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-mono">
                            Booking #{booking.id}
                          </span>
                        </div>

                        <p className="font-medium truncate">{eventTitle}</p>

                        <p className="text-sm text-muted-foreground flex flex-wrap gap-3">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="size-3.5" />
                            {eventDate}
                          </span>
                          {booking.seat_id && (
                            <span className="flex items-center gap-1">
                              <Ticket className="size-3.5" />
                              Seat {booking.seat_id}
                            </span>
                          )}
                          <span>
                            {booking.tickets} ticket{booking.tickets !== 1 ? 's' : ''}
                          </span>
                        </p>
                      </div>

                      {/* Right: amount + payment status */}
                      <div className="shrink-0 text-right space-y-1.5">
                        <p className="text-lg font-bold">
                          ${(parseFloat(booking.total_amount) || 0).toFixed(2)}
                        </p>
                        {payment ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <CreditCard className="size-3.5 text-muted-foreground" />
                            <Badge variant={paymentStatusVariant[payment.status] || 'secondary'} className="text-xs">
                              {payment.status}
                            </Badge>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                            <CreditCard className="size-3.5" />
                            No payment
                          </p>
                        )}
                      </div>

                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
