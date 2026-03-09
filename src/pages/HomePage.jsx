import { useState } from 'react';
import EventList from '../components/events/EventList';
import BookingModal from '../components/booking/BookingModal';
import { Button } from '@/components/ui/button';
import { Ticket, Sparkles, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function HomePage() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <div className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-background/80 text-sm text-muted-foreground mb-6">
            <Sparkles className="size-3.5 text-primary" />
            Discover amazing events near you
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            Book Your Next
            <span className="text-primary"> Experience</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Find the best events, book your tickets instantly, and create unforgettable memories.
          </p>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search events…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </div>
        {/* Decorative gradient blobs */}
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 size-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Event grid */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Ticket className="size-5 text-primary" />
            <h2 className="text-2xl font-bold">Upcoming Events</h2>
          </div>
        </div>
        <EventList onBook={setSelectedEvent} />
      </div>

      {/* Booking modal */}
      {selectedEvent && (
        <BookingModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}
