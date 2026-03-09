import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Ticket, CalendarDays, X } from 'lucide-react';

const statusVariant = {
  confirmed: 'default',
  cancelled: 'destructive',
  pending: 'secondary',
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.id) {
        setError('Please log in to view your bookings.');
        setLoading(false);
        return;
      }
      try {
        const { data } = await bookingsAPI.getByUser(user.id);
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.error || err.response?.data?.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user]);

  const handleCancel = async (id) => {
    try {
      await bookingsAPI.cancel(id);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b))
      );
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel booking');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        <Skeleton className="h-8 w-48" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">My Bookings</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/">
            <CalendarDays className="size-4" />
            Browse Events
          </Link>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-4">
            <Ticket className="size-12 mx-auto text-muted-foreground opacity-40" />
            <p className="text-lg font-medium">No bookings yet</p>
            <p className="text-muted-foreground text-sm">
              You haven&apos;t booked any events yet. Start exploring!
            </p>
            <Button asChild>
              <Link to="/">Browse Events</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Card key={booking.id} className="py-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={statusVariant[booking.status] || 'secondary'}>
                        {booking.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">
                        #{booking.id}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Ticket className="size-3" />
                        {booking.tickets} ticket{booking.tickets !== 1 ? 's' : ''}
                      </span>
                      {' · '}
                      <span className="font-medium text-foreground">
                        ${(parseFloat(booking.total_amount) || 0).toFixed(2)}
                      </span>
                      {' · '}
                      Event #{booking.event_id}
                    </p>
                  </div>
                  {booking.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancel(booking.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                    >
                      <X className="size-4" />
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
