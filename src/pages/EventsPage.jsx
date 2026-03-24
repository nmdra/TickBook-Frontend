import { useMemo, useState } from 'react';
import EventList from '../components/events/EventList';
import BookingModal from '../components/booking/BookingModal';
import { Ticket, Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function EventsPage() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    date: '',
    location: '',
    maxPrice: '',
    sort: 'newest',
  });

  const filterProps = useMemo(
    () => ({
      category: filters.category,
      date: filters.date,
      location: filters.location,
      maxPrice: filters.maxPrice,
      sort: filters.sort,
    }),
    [filters],
  );

  const handleEventAction = (event, action = 'book') => {
    if (action === 'details') return;
    setSelectedEvent(event);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="border-b bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <div className="flex items-center gap-2">
            <Ticket className="size-5 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold">All Events</h1>
          </div>

          <div className="grid gap-3 md:grid-cols-5">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                aria-label="Search events"
                placeholder="Search title, venue or description"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              aria-label="Filter by location"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
            />
            <Input
              aria-label="Filter by category"
              placeholder="Category"
              value={filters.category === 'all' ? '' : filters.category}
              onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value || 'all' }))}
            />
            <Input
              aria-label="Maximum price"
              type="number"
              min="0"
              placeholder="Max price"
              value={filters.maxPrice}
              onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={filters.sort === 'newest' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters((prev) => ({ ...prev, sort: 'newest' }))}
            >
              <SlidersHorizontal className="size-4" />
              Newest
            </Button>
            <Button
              type="button"
              variant={filters.sort === 'popular' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters((prev) => ({ ...prev, sort: 'popular' }))}
            >
              Popular
            </Button>
            <Button
              type="button"
              variant={filters.sort === 'trending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters((prev) => ({ ...prev, sort: 'trending' }))}
            >
              Trending
            </Button>
            <Input
              aria-label="Filter by date"
              type="date"
              value={filters.date}
              onChange={(e) => setFilters((prev) => ({ ...prev, date: e.target.value }))}
              className="w-auto min-w-[180px]"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <EventList onBook={handleEventAction} searchQuery={searchQuery} filters={filterProps} />
      </div>

      {selectedEvent && (
        <BookingModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}
