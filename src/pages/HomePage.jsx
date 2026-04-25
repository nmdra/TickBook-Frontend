import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EventList from '../components/events/EventList';
import BookingModal from '../components/booking/BookingModal';
import { ArrowRight, CalendarCheck, MapPin, ShieldCheck, Sparkles, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';

const proofPoints = [
  { label: 'Curated events', value: 'Live shows, theaters, meetups' },
  { label: 'Seat-first booking', value: 'Pick your place before checkout' },
  { label: 'Digital tickets', value: 'Stored under your bookings' },
];

export default function HomePage() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();

  const handleEventAction = (event) => {
    setSelectedEvent(event);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <section className="hero-image relative min-h-[calc(100svh-4rem)] overflow-hidden text-white">
        <div className="absolute inset-0 subtle-grid opacity-35" />
        <div className="page-shell relative flex min-h-[calc(100svh-4rem)] items-center py-14">
          <div className="max-w-2xl">
            <div className="fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-white/78 backdrop-blur">
              <Sparkles className="size-3.5 text-amber-300" />
              Premium event booking for every seat
            </div>
            <h1 className="fade-up max-w-3xl text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              Find your next seat.
            </h1>
            <p className="fade-up-delay mt-6 max-w-xl text-lg leading-8 text-white/76">
              Discover live experiences, choose seats with confidence, and keep every ticket ready for the door.
            </p>
            <div className="fade-up-delay mt-8 flex flex-wrap gap-3">
              <Button size="lg" className="rounded-full bg-white text-slate-950 hover:bg-white/90" onClick={() => navigate('/events')}>
                Browse Events
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-white/25 bg-white/10 text-white hover:bg-white/16 hover:text-white"
                onClick={() => navigate('/my-bookings')}
              >
                My Bookings
              </Button>
            </div>
          </div>

          <div className="absolute bottom-6 left-4 right-4 hidden grid-cols-3 gap-3 lg:grid">
            {proofPoints.map((point) => (
              <div key={point.label} className="rounded-lg border border-white/12 bg-white/9 p-4 backdrop-blur-md">
                <p className="text-sm font-semibold text-white">{point.label}</p>
                <p className="mt-1 text-sm text-white/65">{point.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b bg-white">
        <div className="page-shell grid gap-8 py-12 md:grid-cols-3">
          <div className="flex gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <CalendarCheck className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold">Browse by schedule</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Sort events by freshness, popularity, trend, and exact event date.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700">
              <MapPin className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold">Filter by venue</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Find nearby concerts, conferences, theater nights, and online events quickly.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold">Book with clarity</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Review tickets, seats, and final price before continuing to checkout.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-12">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
              <Ticket className="size-4" />
              Upcoming Events
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Fresh picks for this week</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              A tighter discovery view for events that are ready to book now.
            </p>
          </div>
          <Button variant="outline" className="rounded-full" onClick={() => navigate('/events')}>
            View all events
            <ArrowRight className="size-4" />
          </Button>
        </div>

        <EventList onBook={handleEventAction} limit={6} />
      </section>

      {selectedEvent && (
        <BookingModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}
