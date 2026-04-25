import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { bookingsAPI } from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { formatEventDate } from '@/lib/utils';
import { getSeatMultiplier } from '@/lib/seatPricing';
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  MapPin,
  Ticket,
} from 'lucide-react';
import GuidedBookingSteps from '../components/booking/GuidedBookingSteps';
import SeatMap from '../components/booking/SeatMap';

function createBookingSessionToken() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  if (window.crypto?.getRandomValues) {
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    return `session_${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`;
  }
  return `session_${Date.now().toString(36)}`;
}

const stepTips = [
  'Review the event details before moving to date and seat selection.',
  'Pick a date/time that works best for your schedule.',
  'Best seats for visibility are usually in Premium rows D–F.',
  'Confirm booking details before proceeding to secure payment.',
];

const STEPS = ['Event Details', 'Date & Time', 'Choose Seat', 'Confirm'];

export default function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const event = location.state?.event || null;

  const [step, setStep] = useState(0);
  const [selectedDateTime, setSelectedDateTime] = useState(event?.date || '');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [highContrast, setHighContrast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const price = parseFloat(event?.price) || 0;
  const isSoldOut = event?.available_tickets != null && event.available_tickets <= 0;
  const tickets = selectedSeats.length;

  const totalPrice = useMemo(() => {
    if (tickets <= 0) return 0;
    const multiplier = selectedSeats.reduce((acc, seatId) => {
      const row = seatId?.[0] || '';
      return acc + getSeatMultiplier(row);
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

  // If no event passed, redirect back
  if (!event) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="size-12 mx-auto text-muted-foreground opacity-40" />
        <p className="text-lg font-medium">No event selected</p>
        <Button onClick={() => navigate('/events')}>
          <ArrowLeft className="size-4" /> Browse Events
        </Button>
      </div>
    );
  }

  const toLocalDateTimeInput = (value) =>
    value ? new Date(value).toISOString().slice(0, 16) : '';

  const handleDateTimeChange = (value) => {
    if (!value) { setSelectedDateTime(''); return; }
    const next = new Date(value);
    if (!Number.isNaN(next.getTime())) setSelectedDateTime(next.toISOString());
  };

  const handleBook = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (tickets <= 0 || !selectedSeats[0]) {
      setError('Please select at least one seat.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let sessionToken = localStorage.getItem('booking_session_token');
      if (!sessionToken) {
        sessionToken = createBookingSessionToken();
        localStorage.setItem('booking_session_token', sessionToken);
      }

      const { data } = await bookingsAPI.create({
        user_id: user.id,
        event_id: event.id,
        seat_id: selectedSeats[0],
        session_token: sessionToken,
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

      navigate('/checkout', { state: { booking: data, event, selectedDateTime, selectedSeats } });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/30">
      {/* ── Header bar ── */}
      <div className="border-b bg-background">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" className="rounded-full gap-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <h1 className="text-lg font-semibold truncate">{event.title}</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">

          {/* ── Left: Step content ── */}
          <div className="space-y-6">
            {/* Step indicator */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {STEPS.map((label, i) => (
                <div key={label} className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => i < step && setStep(i)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      i === step
                        ? 'bg-primary text-primary-foreground'
                        : i < step
                        ? 'bg-primary/10 text-primary cursor-pointer'
                        : 'bg-muted text-muted-foreground cursor-default'
                    }`}
                  >
                    {i < step ? (
                      <CheckCircle2 className="size-3.5" />
                    ) : (
                      <span className="size-4 grid place-items-center rounded-full border text-[10px]">
                        {i + 1}
                      </span>
                    )}
                    {label}
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={`h-px w-6 shrink-0 ${i < step ? 'bg-primary' : 'bg-border'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Tip */}
            <GuidedBookingSteps currentStep={step} tip={stepTips[step]} />

            {/* Sold out alert */}
            {isSoldOut && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>This event is sold out.</AlertDescription>
              </Alert>
            )}

            {/* Error */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* ── Step 0: Event Details ── */}
            {step === 0 && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-xl font-bold">{event.title}</h2>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <CalendarDays className="size-4 shrink-0 text-primary" />
                      {formatEventDate(event.date)}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="size-4 shrink-0 text-primary" />
                      {event.venue || 'Online'}
                    </p>
                    {event.available_tickets != null && (
                      <p className="flex items-center gap-2">
                        <Ticket className="size-4 shrink-0 text-primary" />
                        {event.available_tickets}
                        {event.total_tickets != null ? ` / ${event.total_tickets}` : ''} tickets available
                      </p>
                    )}
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
                  )}
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Base price per seat</span>
                    <span className="text-xl font-bold text-primary">${price.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Step 1: Date & Time ── */}
            {step === 1 && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-lg font-semibold">Choose Date & Time</h2>
                  <div className="space-y-2">
                    <Label htmlFor="dateTime">Custom date/time</Label>
                    <Input
                      id="dateTime"
                      type="datetime-local"
                      value={toLocalDateTimeInput(selectedDateTime)}
                      onChange={(e) => handleDateTimeChange(e.target.value)}
                      min={toLocalDateTimeInput(event.date)}
                    />
                  </div>
                  {dateTimeOptions.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Or pick a slot:</p>
                      <div className="grid sm:grid-cols-3 gap-2">
                        {dateTimeOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setSelectedDateTime(option)}
                            className={`rounded-xl border p-3 text-sm text-left transition-colors ${
                              selectedDateTime === option
                                ? 'border-primary bg-primary/5 font-medium text-primary'
                                : 'hover:border-primary/40 hover:bg-muted/50'
                            }`}
                          >
                            <CalendarDays className="size-4 mb-1 text-muted-foreground" />
                            {new Date(option).toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ── Step 2: Seat Map ── */}
            {step === 2 && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Choose Your Seat</h2>
                    <Button
                      type="button"
                      size="sm"
                      variant={highContrast ? 'default' : 'outline'}
                      onClick={() => setHighContrast((prev) => !prev)}
                    >
                      {highContrast ? 'High Contrast On' : 'High Contrast'}
                    </Button>
                  </div>
                  <SeatMap
                    event={event}
                    selectedSeats={selectedSeats}
                    onChange={setSelectedSeats}
                    highContrast={highContrast}
                  />
                </CardContent>
              </Card>
            )}

            {/* ── Step 3: Confirm ── */}
            {step === 3 && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-lg font-semibold">Confirm Your Booking</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Event</span>
                      <span className="font-medium">{event.title}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Date & Time</span>
                      <span className="font-medium">
                        {selectedDateTime
                          ? new Date(selectedDateTime).toLocaleString()
                          : formatEventDate(event.date)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Venue</span>
                      <span className="font-medium">{event.venue || 'Online'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Seats</span>
                      <span className="font-medium">
                        {selectedSeats.length > 0 ? selectedSeats.join(', ') : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Tickets</span>
                      <span className="font-medium">{tickets}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="font-semibold text-base">Total</span>
                      <span className="text-2xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Navigation buttons ── */}
            <div className="flex gap-3">
              {step > 0 && (
                <Button
                  variant="outline"
                  className="flex-1 rounded-full"
                  size="lg"
                  onClick={() => setStep((s) => s - 1)}
                >
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
              )}
              {step < 3 && (
                <Button
                  className="flex-1 rounded-full"
                  size="lg"
                  disabled={isSoldOut}
                  onClick={() => setStep((s) => s + 1)}
                >
                  {step === 0 && 'Choose Date & Time'}
                  {step === 1 && 'Choose Seat'}
                  {step === 2 && selectedSeats.length === 0 ? 'Select a Seat to Continue' : 'Review & Confirm'}
                  {step === 2 && selectedSeats.length > 0 && null}
                </Button>
              )}
              {step === 3 && (
                <Button
                  className="flex-1 rounded-full gap-2"
                  size="lg"
                  onClick={handleBook}
                  disabled={loading || isSoldOut || selectedSeats.length === 0}
                >
                  <CreditCard className="size-4" />
                  {loading ? 'Booking…' : isAuthenticated ? 'Proceed to Payment' : 'Login to Book'}
                </Button>
              )}
            </div>
          </div>

          {/* ── Right: Summary sidebar ── */}
          <div className="space-y-4 lg:sticky lg:top-24">
            <Card>
              <CardContent className="p-5 space-y-4">
                <h3 className="font-semibold">Booking Summary</h3>

                <div className="rounded-lg overflow-hidden bg-muted/40">
                  {event.image_url ? (
                    <img src={event.image_url} alt={event.title} className="w-full h-32 object-cover" />
                  ) : (
                    <div className="h-32 flex items-center justify-center bg-primary/10">
                      <Ticket className="size-10 text-primary opacity-40" />
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <p className="font-semibold truncate">{event.title}</p>
                  <p className="text-muted-foreground flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" />
                    {formatEventDate(event.date)}
                  </p>
                  <p className="text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
                    {event.venue || 'Online'}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Base price</span>
                    <span>${price.toFixed(2)}</span>
                  </div>
                  {selectedSeats.length > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Seats selected</span>
                      <span>{selectedSeats.join(', ')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-base pt-1 border-t">
                    <span>Total</span>
                    <span className="text-primary">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {selectedSeats.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center">
                    Select seats to see your total
                  </p>
                )}

                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-xs gap-1">
                    <span className="size-2 rounded-full bg-emerald-500 inline-block" />
                    Available
                  </Badge>
                  <Badge variant="outline" className="text-xs gap-1">
                    <span className="size-2 rounded-full bg-red-400 inline-block" />
                    Booked
                  </Badge>
                  <Badge variant="outline" className="text-xs gap-1">
                    <span className="size-2 rounded-full bg-primary inline-block" />
                    Selected
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
