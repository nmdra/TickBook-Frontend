import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { paymentsAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { AlertCircle, CreditCard, ShieldCheck, Ticket, Check } from 'lucide-react';
import GuidedBookingSteps from '@/components/booking/GuidedBookingSteps';

const steps = ['Booking', 'Payment', 'Confirmation'];

function ProgressSteps({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <div className={cn(
            "flex items-center justify-center size-8 rounded-full text-xs font-semibold transition-colors",
            i < current && "bg-primary text-primary-foreground",
            i === current && "bg-primary text-primary-foreground ring-4 ring-primary/20",
            i > current && "bg-muted text-muted-foreground",
          )}>
            {i < current ? <Check className="size-4" /> : i + 1}
          </div>
          <span className={cn("text-sm hidden sm:inline", i === current ? "font-medium" : "text-muted-foreground")}>
            {step}
          </span>
          {i < steps.length - 1 && (
            <div className={cn("w-8 h-px", i < current ? "bg-primary" : "bg-border")} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CheckoutFlow() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const booking = location.state?.booking;
  const event = location.state?.event;
  const selectedDateTime = location.state?.selectedDateTime;
  const selectedSeats = location.state?.selectedSeats || [];

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!booking) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <Ticket className="size-12 mx-auto text-muted-foreground opacity-40" />
            <p className="text-muted-foreground">No booking found. Please select an event first.</p>
            <Button onClick={() => navigate('/')}>Browse Events</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const amount = parseFloat(booking.total_amount) || 0;

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await paymentsAPI.create({
        bookingId: booking.id,
        userId: user?.id,
        amount,
        status: 'pending',
        paymentMethod: 'credit_card',
      });
      navigate('/payment-success', { state: { booking, event, selectedDateTime, selectedSeats } });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <ProgressSteps current={1} />
        <div className="mb-6">
          <GuidedBookingSteps
            currentStep={4}
            tip="Verify your seat and booking details before paying."
          />
        </div>

        <div className="grid gap-6">
          {/* Order Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Ticket className="size-4 text-primary" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {event && (
                <p className="font-medium">{event.title}</p>
              )}
              {selectedDateTime && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Date & Time</span>
                  <span>{new Date(selectedDateTime).toLocaleString()}</span>
                </div>
              )}
              {selectedSeats.length > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Seats</span>
                  <span>{selectedSeats.join(', ')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Booking ID</span>
                <span className="font-mono">{booking.id}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Tickets</span>
                <span>{booking.tickets}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-medium">Total</span>
                <span className="text-xl font-bold text-primary">${amount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="size-4 text-primary" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handlePayment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="card">Card number</Label>
                  <Input
                    id="card"
                    type="text"
                    required
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry</Label>
                    <Input
                      id="expiry"
                      type="text"
                      required
                      maxLength={5}
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="MM/YY"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      type="text"
                      required
                      maxLength={4}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="123"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? 'Processing…' : `Pay $${amount.toFixed(2)}`}
                </Button>

                <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                  <ShieldCheck className="size-3" />
                  Secure payment processing
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
