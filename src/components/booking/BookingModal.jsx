import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { bookingsAPI } from '../../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatEventDate } from '@/lib/utils';
import { X, CalendarDays, MapPin, Ticket, AlertCircle } from 'lucide-react';
import GuidedBookingSteps from './GuidedBookingSteps';
import SeatMap from './SeatMap';

export default function BookingModal({ event, onClose }) {
  const [step, setStep] = useState(0);
  const [selectedDateTime, setSelectedDateTime] = useState(event?.date || '');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [highContrast, setHighContrast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const price = parseFloat(event?.price) || 0;
  const isSoldOut = event?.available_tickets != null && event.available_tickets <= 0;
  const tickets = selectedSeats.length;
  const totalPrice = useMemo(() => {
    if (tickets <= 0) return 0;
    const multiplier = selectedSeats.reduce((acc, seatId) => {
      const row = seatId?.[0] || '';
      if (row <= 'C') return acc + 1.7;
      if (row <= 'F') return acc + 1.25;
      return acc + 1;
    }, 0);
    return price * multiplier;
  }, [price, selectedSeats, tickets]);

  const dateTimeOptions = useMemo(() => {
    if (!event?.date) return [];
    const base = new Date(event.date);
    if (Number.isNaN(base.getTime())) return [];
    return [0, 2, 4].map((hourOffset) => {
      const dt = new Date(base);
      dt.setHours(dt.getHours() + hourOffset);
      return dt.toISOString();
    });
  }, [event?.date]);

  if (!event) return null;

  const stepTips = [
    'Review the event details before moving to date and seat selection.',
    'Pick a date/time that works best for your schedule.',
    'Best seats for visibility are usually in Premium rows D–F.',
    'Confirm booking details before proceeding to secure payment.',
    'Securely complete your payment to lock your seats.',
    'Show your digital ticket and QR at the venue entrance.',
  ];

  const handleBook = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (tickets <= 0) {
      setError('Please select at least one seat.');
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

      const existingMeta = JSON.parse(localStorage.getItem('ticket_meta') || '{}');
      existingMeta[data.id] = {
        eventId: event.id,
        eventTitle: event.title,
        dateTime: selectedDateTime,
        seats: selectedSeats,
      };
      localStorage.setItem('ticket_meta', JSON.stringify(existingMeta));

      onClose();
      navigate('/checkout', { state: { booking: data, event, selectedDateTime, selectedSeats } });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-background rounded-xl shadow-2xl w-full max-w-3xl mx-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-0">
          <h3 className="text-xl font-semibold">Book Tickets</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="size-8 rounded-full">
            <X className="size-4" />
          </Button>
        </div>

        <div className="p-6 space-y-5">
          <GuidedBookingSteps currentStep={step} tip={stepTips[step]} />

          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <p className="font-semibold">{event.title}</p>
            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-3.5" />
                {formatEventDate(event.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {event.venue || 'Online'}
              </span>
            </div>
            <p className="text-primary font-semibold">${price.toFixed(2)} base price</p>
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
              {step === 1 && (
                <div className="space-y-2">
                  <Label htmlFor="dateTime">Choose date/time</Label>
                  <Input
                    id="dateTime"
                    type="datetime-local"
                    value={selectedDateTime ? new Date(selectedDateTime).toISOString().slice(0, 16) : ''}
                    onChange={(e) => {
                      if (!e.target.value) {
                        setSelectedDateTime('');
                        return;
                      }
                      const nextValue = new Date(e.target.value);
                      if (!Number.isNaN(nextValue.getTime())) {
                        setSelectedDateTime(nextValue.toISOString());
                      }
                    }}
                    min={event.date ? new Date(event.date).toISOString().slice(0, 16) : undefined}
                  />
                  {dateTimeOptions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {dateTimeOptions.map((option) => (
                        <Button
                          key={option}
                          type="button"
                          variant={selectedDateTime === option ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedDateTime(option)}
                        >
                          {new Date(option).toLocaleString()}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Seat selection</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant={highContrast ? 'default' : 'outline'}
                      onClick={() => setHighContrast((prev) => !prev)}
                    >
                      {highContrast ? 'High Contrast On' : 'High Contrast Mode'}
                    </Button>
                  </div>
                  <SeatMap
                    event={event}
                    selectedSeats={selectedSeats}
                    onChange={setSelectedSeats}
                    highContrast={highContrast}
                  />
                </div>
              )}

              {step === 3 && (
                <>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">Confirm your booking details</p>
                    <p className="text-muted-foreground">
                      Date & Time: {selectedDateTime ? new Date(selectedDateTime).toLocaleString() : formatEventDate(event.date)}
                    </p>
                    <p className="text-muted-foreground">
                      Seats: {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Not selected'}
                    </p>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="text-2xl font-bold">${totalPrice.toFixed(2)}</span>
                  </div>
                </>
              )}
            </>
          )}

          {step === 0 && (
            <Button className="w-full" size="lg" onClick={() => setStep(1)} disabled={isSoldOut}>
              Continue to Date/Time
            </Button>
          )}
          {step === 1 && (
            <div className="flex gap-2">
              <Button className="w-full" variant="outline" size="lg" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button className="w-full" size="lg" onClick={() => setStep(2)}>
                Continue to Seats
              </Button>
            </div>
          )}
          {step === 2 && (
            <div className="flex gap-2">
              <Button className="w-full" variant="outline" size="lg" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button className="w-full" size="lg" onClick={() => setStep(3)} disabled={selectedSeats.length === 0}>
                Continue to Confirm
              </Button>
            </div>
          )}
          {step === 3 && (
            <div className="flex gap-2">
              <Button className="w-full" variant="outline" size="lg" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                className="w-full"
                size="lg"
                onClick={handleBook}
                disabled={loading || isSoldOut || selectedSeats.length === 0}
              >
                {loading ? 'Booking…' : isAuthenticated ? 'Proceed to Payment' : 'Login to Book'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
