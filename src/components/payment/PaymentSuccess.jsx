import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Ticket, CalendarDays, ArrowRight } from 'lucide-react';
import GuidedBookingSteps from '@/components/booking/GuidedBookingSteps';

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;
  const event = location.state?.event;
  const selectedDateTime = location.state?.selectedDateTime;
  const selectedSeats = location.state?.selectedSeats || [];

  if (!booking) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <Ticket className="size-12 mx-auto text-muted-foreground opacity-40" />
            <p className="text-muted-foreground">No payment information found.</p>
            <Button onClick={() => navigate('/')}>Browse Events</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const amount = parseFloat(booking.total_amount) || 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg text-center">
        <CardContent className="pt-8 pb-8 space-y-6">
          <GuidedBookingSteps
            currentStep={5}
            tip="Your booking is complete. Save or download your ticket for venue check-in."
          />

          {/* Success icon */}
          <div className="mx-auto size-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="size-8 text-green-600" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Payment Successful!</h2>
            <p className="text-muted-foreground">
              Your tickets have been confirmed. A confirmation email will be sent shortly.
            </p>
          </div>

          <Separator />

          {/* Details */}
          <div className="rounded-lg border bg-muted/30 p-4 text-left space-y-3">
            {event?.title && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Event</span>
                <span className="font-medium">{event.title}</span>
              </div>
            )}
            {selectedDateTime && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date & Time</span>
                <span>{new Date(selectedDateTime).toLocaleString()}</span>
              </div>
            )}
            {selectedSeats.length > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Seat(s)</span>
                <span>{selectedSeats.join(', ')}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Booking ID</span>
              <span className="font-mono">{booking.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <CalendarDays className="size-3" />
                Tickets
              </span>
              <span>{booking.tickets}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Amount Paid</span>
              <span className="text-lg font-bold text-primary">${amount.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button className="flex-1" asChild>
              <Link to="/my-bookings">
                <Ticket className="size-4" />
                My Bookings
              </Link>
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <Link to="/">
                Browse Events
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
