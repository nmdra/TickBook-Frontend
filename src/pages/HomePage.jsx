import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EventList from '../components/events/EventList';
import BookingModal from '../components/booking/BookingModal';
import { Ticket, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GuidedBookingSteps from '@/components/booking/GuidedBookingSteps';

export default function HomePage() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();

  const handleEventAction = (event) => {
    setSelectedEvent(event);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <div className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-background/80 text-sm text-muted-foreground mb-6">
            <Sparkles className="size-3.5 text-primary" />
            Discover amazing events near you.
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            Book Your Next
            <span className="text-primary"> Experience</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Find the best events, book your tickets instantly, and create unforgettable memories.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" onClick={() => navigate('/events')}>
              Book Tickets Now
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/events')}>
              Browse All Events
            </Button>
          </div>
        </div>
        {/* Decorative gradient blobs */}
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 size-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Event grid */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-6">
          <GuidedBookingSteps
            currentStep={0}
            tip="Select an event to begin. Use filters and details to quickly find the right experience."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mb-8">
          <div className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">Latest Events</p>
            <h3 className="text-lg font-semibold mt-1">Fresh this week</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Browse newly added events with quick-book from the cards below.
            </p>
            <Button size="sm" className="mt-3" onClick={() => navigate('/events')}>
              Explore Latest
            </Button>
          </div>
          <div className="rounded-xl border bg-primary/5 p-5">
            <p className="text-sm text-muted-foreground">Featured & Promotions</p>
            <h3 className="text-lg font-semibold mt-1">Save up to 20% on select shows</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Look for trending and popular tags on the All Events page for special picks.
            </p>
            <Button size="sm" variant="outline" className="mt-3" onClick={() => navigate('/events')}>
              View Featured
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Ticket className="size-5 text-primary" />
            <h2 className="text-2xl font-bold">Upcoming Events</h2>
          </div>
        </div>
        <EventList onBook={handleEventAction} />
      </div>

      {/* Booking modal */}
      {selectedEvent && (
        <BookingModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}
