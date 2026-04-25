import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EventList from '../components/events/EventList';
import { CalendarDays, Search, SlidersHorizontal, Ticket } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Popular' },
  { value: 'trending', label: 'Trending' },
];

export default function EventsPage() {
  const navigate = useNavigate();
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

  // Navigate to the full booking page instead of opening a popup
  const handleEventAction = (event) => {
    navigate('/book', { state: { event } });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({ category: 'all', date: '', location: '', maxPrice: '', sort: 'newest' });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <section className="border-b bg-white">
        <div className="page-shell py-10">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
                <Ticket className="size-4" />
                Event Discovery
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Browse Events</h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Filter by venue, date, price, and category before choosing seats.
              </p>
            </div>
            <Button variant="outline" className="rounded-full" onClick={clearFilters}>
              Reset filters
            </Button>
          </div>

          <div className="surface-panel rounded-2xl p-4">
            <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_0.8fr]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  aria-label="Search events"
                  placeholder="Search events, venues, descriptions"
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Input
                aria-label="Filter by location"
                placeholder="Venue or city"
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

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="mr-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <SlidersHorizontal className="size-4" />
                Sort
              </span>
              {sortOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={filters.sort === option.value ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full"
                  onClick={() => setFilters((prev) => ({ ...prev, sort: option.value }))}
                >
                  {option.label}
                </Button>
              ))}
              <div className="relative ml-0 sm:ml-auto">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  aria-label="Filter by date"
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-auto min-w-[190px] pl-9"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-10">
        <EventList onBook={handleEventAction} searchQuery={searchQuery} filters={filterProps} />
      </section>
    </div>
  );
}
