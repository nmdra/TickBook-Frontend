import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { bookingsAPI } from '../../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, CalendarDays, MapPin, Ticket, Minus, Plus, AlertCircle } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-background rounded-xl shadow-2xl w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <h3 className="text-xl font-semibold">Book Tickets</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="size-8 rounded-full">
            <X className="size-4" />
          </Button>
        </div>

        <div className="p-6 space-y-5">
          {/* Event Info */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <p className="font-semibold">{event.title}</p>
            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-3.5" />
                {event.date ? new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'TBA'}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {event.venue || 'Online'}
              </span>
            </div>
            <p className="text-primary font-semibold">${price.toFixed(2)} per ticket</p>
            {event.available_tickets != null && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Ticket className="size-3" />
                {event.available_tickets}{event.total_tickets != null ? ` / ${event.total_tickets}` : ''} available
              </p>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isSoldOut ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>This event is sold out.</AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Ticket selector */}
              <div className="space-y-2">
                <Label htmlFor="tickets">Number of tickets</Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-9"
                    onClick={() => setTickets(Math.max(1, tickets - 1))}
                    disabled={tickets <= 1}
                  >
                    <Minus className="size-4" />
                  </Button>
                  <Input
                    id="tickets"
                    type="number"
                    min="1"
                    max={maxTickets}
                    value={tickets}
                    onChange={(e) => setTickets(Math.max(1, Math.min(maxTickets, Number(e.target.value))))}
                    className="w-20 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-9"
                    onClick={() => setTickets(Math.min(maxTickets, tickets + 1))}
                    disabled={tickets >= maxTickets}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="text-2xl font-bold">${totalPrice.toFixed(2)}</span>
              </div>
            </>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={handleBook}
            disabled={loading || isSoldOut}
          >
            {loading ? 'Booking…' : isAuthenticated ? 'Proceed to Checkout' : 'Login to Book'}
          </Button>
        </div>
      </div>
    </div>
  );
}
