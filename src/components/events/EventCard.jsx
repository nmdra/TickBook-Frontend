import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatEventDate } from '@/lib/utils';
import { CalendarDays, MapPin, Ticket } from 'lucide-react';

export default function EventCard({ event, onBook }) {
  const price = parseFloat(event.price) || 0;
  const isSoldOut = event.available_tickets != null && event.available_tickets <= 0;

  return (
    <Card className="group overflow-hidden py-0 transition-all hover:shadow-lg hover:-translate-y-0.5">
      <div className="relative bg-gradient-to-br from-primary/80 to-primary h-40 flex items-center justify-center overflow-hidden">
        <span className="text-5xl opacity-80 group-hover:scale-110 transition-transform duration-300">🎭</span>
        {isSoldOut && (
          <Badge variant="destructive" className="absolute top-3 right-3">
            Sold Out
          </Badge>
        )}
        {!isSoldOut && event.available_tickets != null && event.available_tickets <= 10 && (
          <Badge className="absolute top-3 right-3 bg-amber-500 text-white border-0">
            {event.available_tickets} left
          </Badge>
        )}
      </div>

      <CardContent className="p-5 space-y-3">
        <h3 className="text-lg font-semibold leading-snug line-clamp-1">
          {event.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {event.description || 'No description available.'}
        </p>
        <p className="text-xs text-muted-foreground">
          {event.category || 'General'}
        </p>

        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            {formatEventDate(event.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5" />
            {event.venue || 'Online'}
          </span>
        </div>

        {event.available_tickets != null && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Ticket className="size-3" />
            {event.available_tickets}{event.total_tickets != null ? ` / ${event.total_tickets}` : ''} available
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xl font-bold text-primary">
            ${price.toFixed(2)}
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => onBook(event, 'details')}>
              Details
            </Button>
            <Button
              size="sm"
              onClick={() => onBook(event, 'book')}
              disabled={isSoldOut}
            >
              {isSoldOut ? 'Sold Out' : 'Book Now'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
