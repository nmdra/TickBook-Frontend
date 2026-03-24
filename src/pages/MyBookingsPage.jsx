import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingsAPI, eventsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Ticket, CalendarDays, Download, Share2, X } from 'lucide-react';
import { formatEventDate } from '@/lib/utils';

const statusVariant = {
  confirmed: 'default',
  cancelled: 'destructive',
  pending: 'secondary',
};

function getEventTitle(booking) {
  return booking.event?.title || booking.ticketMeta?.eventTitle || `Event #${booking.event_id}`;
}

function getBookingDateText(booking) {
  return booking.ticketMeta?.dateTime
    ? new Date(booking.ticketMeta.dateTime).toLocaleString()
    : formatEventDate(booking.event?.date);
}

function getBookingSeatsText(booking, fallbackText) {
  return booking.ticketMeta?.seats?.join(', ') || fallbackText;
}

function getTicketLabel(tickets) {
  return `${tickets} ticket${tickets !== 1 ? 's' : ''}`;
}

function generateQRData(booking) {
  return `TICKBOOK|BOOKING:${booking.id}|EVENT:${getEventTitle(booking)}|SEATS:${(booking.ticketMeta?.seats || ['GENERAL']).join('-')}`;
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('notification_prefs') || '{"reminders":true,"seatAlerts":false,"priceDrops":false}');
    } catch {
      return { reminders: true, seatAlerts: false, priceDrops: false };
    }
  });
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
        const list = Array.isArray(data) ? data : [];

        const eventIds = [...new Set(list.map((booking) => booking.event_id).filter(Boolean))];
        const eventsById = {};
        await Promise.all(
          eventIds.map(async (eventId) => {
            try {
              const response = await eventsAPI.getById(eventId);
              eventsById[eventId] = response.data;
            } catch {
              eventsById[eventId] = null;
            }
          }),
        );

        const ticketMeta = JSON.parse(localStorage.getItem('ticket_meta') || '{}');
        const enriched = list.map((booking) => ({
          ...booking,
          event: eventsById[booking.event_id] || null,
          ticketMeta: ticketMeta[booking.id] || null,
        }));
        setBookings(enriched);
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

  const downloadTicket = (booking) => {
    const title = getEventTitle(booking);
    const dateText = getBookingDateText(booking);
    const seats = getBookingSeatsText(booking, `General (${getTicketLabel(booking.tickets)})`);
    const qrData = generateQRData(booking);
    const payload = [
      'TickBook Digital Ticket',
      `Booking #${booking.id}`,
      `Event: ${title}`,
      `Date/Time: ${dateText}`,
      `Seats: ${seats}`,
      `QR: ${qrData}`,
    ].join('\n');
    const blob = new Blob([payload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket-${booking.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const shareTicket = async (booking) => {
    const title = getEventTitle(booking);
    const dateText = getBookingDateText(booking);
    const seats = getBookingSeatsText(booking, getTicketLabel(booking.tickets));
    const text = `I'm attending ${title} on ${dateText}. Seats: ${seats}. Booking #${booking.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My TickBook Ticket', text });
      } catch {
        // user canceled share
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setError('Unable to copy share text automatically on this device.');
    }
  };

  const toggleNotification = (key) => {
    setNotifications((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('notification_prefs', JSON.stringify(next));
      return next;
    });
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

      <Card className="mb-6">
        <CardContent className="p-5 space-y-3">
          <h3 className="font-semibold">Notifications</h3>
          <p className="text-sm text-muted-foreground">Set reminders and alerts for your upcoming events.</p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={notifications.reminders ? 'default' : 'outline'}
              onClick={() => toggleNotification('reminders')}
            >
              Event Reminder
            </Button>
            <Button
              size="sm"
              variant={notifications.seatAlerts ? 'default' : 'outline'}
              onClick={() => toggleNotification('seatAlerts')}
            >
              Seat Availability Alerts
            </Button>
            <Button
              size="sm"
              variant={notifications.priceDrops ? 'default' : 'outline'}
              onClick={() => toggleNotification('priceDrops')}
            >
              Price Drop Alerts
            </Button>
          </div>
        </CardContent>
      </Card>

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
                      <span className="font-medium text-foreground">
                        {getEventTitle(booking)}
                      </span>
                      {' · '}
                      {getBookingDateText(booking)}
                      {' · '}
                      {booking.ticketMeta?.seats?.length ? `Seat ${booking.ticketMeta.seats.join(', ')}` : null}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Ticket className="size-3" />
                        {getTicketLabel(booking.tickets)}
                      </span>
                      {' · '}
                      <span className="font-medium text-foreground">
                        ${(parseFloat(booking.total_amount) || 0).toFixed(2)}
                      </span>
                    </p>
                    <div className="mt-2 rounded-md border bg-muted/20 p-2 text-xs">
                      <p className="font-medium">Digital Ticket (QR Data)</p>
                      <p className="text-muted-foreground break-all">
                        {generateQRData(booking)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => downloadTicket(booking)}>
                      <Download className="size-4" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => shareTicket(booking)}>
                      <Share2 className="size-4" />
                      Share
                    </Button>
                    {booking.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancel(booking.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="size-4" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
