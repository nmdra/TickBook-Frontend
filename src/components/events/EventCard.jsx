import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatEventDate } from '@/lib/utils';
import { CalendarDays, MapPin, Ticket, ArrowRight } from 'lucide-react';

function getEventAccent(event) {
  const source = `${event.category || event.title || 'event'}`.toLowerCase();
  if (source.includes('music') || source.includes('concert')) return 'from-rose-500 to-amber-500';
  if (source.includes('tech') || source.includes('conference')) return 'from-cyan-600 to-blue-700';
  if (source.includes('theater') || source.includes('art')) return 'from-violet-600 to-fuchsia-600';
  if (source.includes('sport')) return 'from-emerald-600 to-lime-600';
  return 'from-primary to-slate-900';
}

function getAvailabilityLabel(event, isSoldOut) {
  if (isSoldOut) return 'Sold Out';
  if (event.available_tickets != null && event.available_tickets <= 10) {
    return `${event.available_tickets} left`;
  }
  return event.category || 'Featured';
}

export default function EventCard({ event, onBook }) {
  const price = parseFloat(event.price) || 0;
  const isSoldOut = event.available_tickets != null && event.available_tickets <= 0;
  const sold = Math.max(0, (Number(event.total_tickets) || 0) - (Number(event.available_tickets) || 0));
  const total = Number(event.total_tickets) || 0;
  const soldPercent = total > 0 ? Math.min(100, Math.round((sold / total) * 100)) : 0;

  return (
    <Card className="group overflow-hidden py-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className={`relative h-44 overflow-hidden bg-gradient-to-br ${getEventAccent(event)}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.24),transparent_34%),linear-gradient(180deg,transparent,rgba(2,6,23,0.42))]" />
        <div className="absolute left-4 top-4">
          <Badge className={isSoldOut ? '' : 'border-0 bg-white/90 text-slate-950 hover:bg-white/90'}>
            {getAvailabilityLabel(event, isSoldOut)}
          </Badge>
        </div>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <p className="text-xs font-medium uppercase text-white/72">{event.venue || 'Online'}</p>
          <h3 className="mt-1 line-clamp-2 text-xl font-bold leading-tight">{event.title}</h3>
        </div>
      </div>

      <CardContent className="p-5">
        <p className="line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
          {event.description || 'Event details will be announced soon.'}
        </p>

        <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <CalendarDays className="size-4 text-primary" />
            {formatEventDate(event.date)}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="size-4 text-primary" />
            {event.venue || 'Online'}
          </span>
        </div>

        {event.available_tickets != null && (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Ticket className="size-3.5" />
                {event.available_tickets}{event.total_tickets != null ? ` / ${event.total_tickets}` : ''} available
              </span>
              {total > 0 && <span>{soldPercent}% sold</span>}
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${soldPercent}%` }} />
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between gap-3 border-t pt-4">
          <div>
            <p className="text-xs text-muted-foreground">From</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">${price.toFixed(2)}</p>
          </div>
          <Button
            size="sm"
            className="rounded-full gap-2"
            onClick={() => onBook(event)}
            disabled={isSoldOut}
          >
            {isSoldOut ? 'Sold Out' : 'Book'}
            {!isSoldOut && <ArrowRight className="size-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
